package pt.lsts.ripples.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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

	@Value("${stormglass.api-key}")
	private String apiKey;

	private String url = "https://api.stormglass.io/v1/weather/point?";

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
	@GetMapping(path = { "/weather", "/weather/" }, produces = "application/json")
	public List<WeatherStatus> fetchWeather(@RequestParam(required = true) Double lat,
			@RequestParam(required = true) Double lng, @RequestParam(required = false) String params) {
		try {
			StringBuilder finalUrl = new StringBuilder(url);
			finalUrl.append("lat=").append(lat);
			finalUrl.append("&lng=").append(lng);
			finalUrl.append("&params=").append(params);

			Calendar calendar = Calendar.getInstance();
			calendar.setTime(new Date());
			calendar.add(Calendar.DAY_OF_YEAR, -2);
			Date startTime = calendar.getTime();
			calendar.add(Calendar.DAY_OF_YEAR, 4);
			Date endTime = calendar.getTime();

			String startTimeStr = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(startTime);
			String endTimeStr = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(endTime);

			finalUrl.append("&start=").append(startTimeStr);
			finalUrl.append("&end=").append(endTimeStr);

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
			List<WeatherStatus> weatherStatus = this.parseWeatherJsonArray((JSONArray) json.get("hours"));
			return weatherStatus;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public List<WeatherStatus> parseWeatherJsonArray(JSONArray jsonArray) {
		ArrayList<WeatherStatus> weatherData = new ArrayList<WeatherStatus>();
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject currentObj = (JSONObject) jsonArray.get(i);
			try {
				Date timestamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").parse(currentObj.get("time").toString());
				WeatherStatus status = new WeatherStatus(timestamp, currentObj);
				weatherData.add(status);
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		return weatherData;
	}
}