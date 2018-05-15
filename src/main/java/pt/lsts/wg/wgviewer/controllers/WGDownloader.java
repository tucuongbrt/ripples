package pt.lsts.wg.wgviewer.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpURLConnection;
import java.net.PasswordAuthentication;
import java.util.Date;
import java.util.StringJoiner;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.domain.WGCtd;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;

@Component
public class WGDownloader {

	@Value("${wgms.user}")
	private String user;

	@Value("${wgms.pass}")
	private String password;

	@Autowired
	private EnvDataRepository repo;
	
	private final Logger logger = LoggerFactory.getLogger(WGDownloader.class);
	
	/**
	 * Liquid Robotics data portal URL to query wg sensors data
	 */
	private final String URL = "https://dataportal.liquidr.net/firehose/?";

	/**
	 * WG SV3-127 id in the data portal
	 */
	private final String vids = "1315596328";

	private void processData(String data) {
		logger.info("Getting data...");
		JsonParser parser = new JsonParser();
		JsonArray root = parser.parse(data).getAsJsonArray();
		Gson gson = new Gson();
		root.forEach(element -> {
			JsonObject jo = element.getAsJsonArray().get(0).getAsJsonObject();
			if (jo.get("kind").getAsString().equals("CTD")) {
				logger.info(""+jo);
				WGCtd ctd = gson.fromJson(jo, WGCtd.class);
				EnvDatum datum = new EnvDatum();
				datum.setLatitude(ctd.getLatitude());
				datum.setLongitude(ctd.getLongitude());
				datum.setSource("wg-sv3-127");
				datum.setTimestamp(new Date(ctd.getTime()));
				datum.getValues().put("conductivity", ctd.getConductivity());
				datum.getValues().put("temperature", ctd.getTemperature());
				datum.getValues().put("salinity", ctd.getSalinity());
				datum.getValues().put("pressure", ctd.getPressure());
				repo.save(datum);
			}
		});
		logger.info("Finished getting data.");
	}
	
	//@PostConstruct
	public void initialData() {
		processData(getData("CTD", "-12h"));
	}
	@Scheduled(fixedRate = 60_000)
	public void updateWGData() {
		processData(getData("CTD", "-1m"));
	}	

	public static String getQueryParam(String param, String value) {
		StringBuilder sb = new StringBuilder();
		sb.append(param);
		sb.append('=');
		sb.append(value);
		return sb.toString();
	}

	public String getVehicleID() {
		return getQueryParam("vids", vids);
	}

	private String getQuery(String param, String start) {
		StringJoiner sj = new StringJoiner("&", URL, "");
		String end = "-0m";
		sj.add(getQueryParam("start", start));
		sj.add(getQueryParam("end", end));
		sj.add(getQueryParam("format", "json"));
		sj.add(getQueryParam("kinds", param));
		sj.add(getVehicleID());

		return sj.toString();
	}

	public String getData(String p, String start) {
		String query_url = getQuery(p, start);
		String dataPath = getQueryData(query_url, p);
		return dataPath;
	}

	@PostConstruct
	private void authenticate() {
		try {
			Authenticator.setDefault(new Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(user, password.toCharArray());
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
		logger.info("Authenticated.");		
	}

	/**
	 * Returns file path where the queried data as written
	 * 
	 * @param req
	 *            request query
	 * @return File path to data
	 */
	private String getQueryData(String req, String param) {
		try {
			CookieHandler.setDefault(new CookieManager(null, CookiePolicy.ACCEPT_ALL));
			HttpURLConnection conn = (HttpURLConnection) new java.net.URL(req).openConnection();
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			FileCopyUtils.copy(conn.getInputStream(), baos);
			conn.getInputStream().close();
			return baos.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static void main(String args[]) {

	}
}