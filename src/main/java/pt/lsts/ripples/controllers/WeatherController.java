package pt.lsts.ripples.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Calendar;
import java.util.Date;

import com.google.gson.Gson;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import pt.lsts.ripples.domain.assets.WeatherStatus;

@RestController
public class WeatherController {

	private final Logger logger = LoggerFactory.getLogger(WeatherController.class);
	
	@Value("${stormGlass.apiKey}")
	private String apiKey;

	private String url = "https://api.stormglass.io/v1/weather/point?";
	
	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
    @GetMapping(path = {"/weather", "/weather/"}, produces = "application/json")
    public WeatherStatus fetchWeather(@RequestParam(required=true) Double lat, @RequestParam(required=true) Double lng, @RequestParam(required=false) String params) {
		try {
			StringBuilder finalUrl = new StringBuilder(url);
			finalUrl.append("lat=").append(lat);
			finalUrl.append("&lng=").append(lng);
			finalUrl.append("&params=").append(params);
			Date currentTime = Calendar.getInstance().getTime();
			String currentTimeStr = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(currentTime);
			finalUrl.append("&start=").append(currentTimeStr);
			finalUrl.append("&end=").append(currentTimeStr);
			URL stormGlass = new URL(finalUrl.toString());

			HttpURLConnection con = (HttpURLConnection) stormGlass.openConnection();
			con.setRequestMethod("GET");
			con.setRequestProperty("Content-Type", "application/json");
			con.setRequestProperty("Authorization", apiKey);
			con.setDoOutput(true);

			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String line;
			StringBuffer response = new StringBuffer();
			while ((line = in.readLine()) != null) {
				response.append(line);
			}
			in.close();
			con.disconnect();

			logger.info("Received weather for location { lat = " + lat + ", lng = " + lng + " }");

			JSONParser parser = new JSONParser(JSONParser.MODE_JSON_SIMPLE);
			JSONObject json = (JSONObject) parser.parse(response.toString());
			JSONObject currentWeather = (JSONObject) ((JSONArray) json.get("hours")).get(0);

			return new WeatherStatus(currentTime, currentWeather);
		}
		catch (Exception e) {
			e.printStackTrace();		
		}
		return null;
    }
}