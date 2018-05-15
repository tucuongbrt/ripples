package pt.lsts.wg.wgviewer.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpURLConnection;
import java.net.PasswordAuthentication;
import java.net.URL;
import java.text.SimpleDateFormat;
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
import pt.lsts.wg.wgviewer.domain.PosDatum;
import pt.lsts.wg.wgviewer.domain.WGCtd;
import pt.lsts.wg.wgviewer.domain.WGPosition;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;
import pt.lsts.wg.wgviewer.repo.PosDataRepository;

@Component
public class WGDownloader {

	@Value("${wgms.user}")
	private String user;

	@Value("${wgms.pass}")
	private String password;

	@Autowired
	private EnvDataRepository envRepo;
	
	@Autowired
	private PosDataRepository posRepo;
	
	private final Logger logger = LoggerFactory.getLogger(WGDownloader.class);
	
	/**
	 * Liquid Robotics data portal URL to query wg sensors data
	 */
	private final String URL = "https://dataportal.liquidr.net/firehose/?";
	private final String RIPPLESURL = "http://ripples.lsts.pt/api/v1/systems";
	private final double METERPSECS_KNOTS = 1.94384449;
	private final int imcID = 0x2801;
	private SimpleDateFormat fmt = new SimpleDateFormat("YYYY-MM-dd'T'HH:mm:ssZ");


	/**
	 * WG SV3-127 id in the data portal
	 */
	private final String vids = "1315596328";

	private void processData(String data) {
		JsonParser parser = new JsonParser();
		JsonArray root = parser.parse(data).getAsJsonArray();
		Gson gson = new Gson();
		root.forEach(element -> {
			JsonObject jo = element.getAsJsonArray().get(0).getAsJsonObject();
			logger.info(""+jo);
			if (jo.get("kind").getAsString().equals("CTD")) {
				logger.info("Getting CTD data...");
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
				envRepo.save(datum);
			}
			if (jo.get("kind").getAsString().equals("Waveglider")) {
				logger.info("Getting Position data...");
				WGPosition pos = gson.fromJson(jo, WGPosition.class);
				PosDatum datum = new PosDatum();
				datum.setLatitude(pos.getLatitude());
				datum.setLongitude(pos.getLongitude());
				datum.setSource("wg-sv3-127");
				datum.setTimestamp(new Date(pos.getTime()));
				datum.setUpdated_at(new Date(System.currentTimeMillis()));
				datum.setSpeed(pos.getCurrentSpeed());
				sendToRipples(datum);
				posRepo.save(datum);
			}
		});
		logger.info("Finished getting data.");
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
	
	@PostConstruct
	public void initialData() {
		// if there is no data...
		if (!envRepo.findAll().iterator().hasNext())
			processData(getData("CTD", "-30d"));
	}
	
	@PostConstruct
	@Scheduled(fixedRate = 180_000)
	public void updateWGData() {
		processData(getData("CTD,Waveglider", "-5m"));
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
	
	 /**
     * Adapted from https://github.com/paulosousadias/mbari-pos-ripples/blob/master/src/main/java/pt/lsts/mbari/Positions.java#L206
     * @param datum json object to send to ripples
     */
    public void sendToRipples(PosDatum datum){
    	logger.info("Sending state to "+RIPPLESURL);
    	JsonObject obj = new JsonObject();
    	JsonArray coords = new JsonArray();
    	coords.add(datum.getLatitude());
    	coords.add(datum.getLongitude());
    	obj.addProperty("imcid", imcID);
    	obj.addProperty("name", datum.getSource());
    	obj.add("coordinates",coords);
    	obj.addProperty("iridium", "");
    	obj.addProperty("created_at", fmt.format(datum.getTimestamp()));
    	obj.addProperty("updated_at", fmt.format(datum.getUpdated_at()));
    	obj.addProperty("speed", datum.getSpeed()/ METERPSECS_KNOTS);

		try {
			URL url = null;
			try {
				url = new URL(RIPPLESURL);
				HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
				httpCon.setDoOutput(true);
				httpCon.setRequestMethod("PUT");
				httpCon.setRequestProperty("Content-Type", "application/json");

				
				OutputStreamWriter out = new OutputStreamWriter(httpCon.getOutputStream());
				out.write(obj.toString());
				out.close();
				httpCon.getInputStream();
				String response = httpCon.getResponseMessage();
				if(response.equals(Integer.toString(HttpURLConnection.HTTP_OK)))
					logger.info("Sent: "+obj.getAsString());
				else
					logger.warn("Got: "+response+" from "+RIPPLESURL);
			}
			catch (Exception e) {
				e.printStackTrace();
			}
			System.out.println(datum);
		}
		catch (Exception e) {
			e.printStackTrace();
		}
    }
    

	public static void main(String args[]) {

	}
}