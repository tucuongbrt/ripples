package pt.lsts.wg.wgviewer.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpURLConnection;
import java.net.PasswordAuthentication;
import java.text.SimpleDateFormat;
import java.util.StringJoiner;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

@Component
public class WGDownloader {

	
	@Value("${wgms.user}")
	private String user;
	
	@Value("${wgms.pass}")
	private String password;
	
	public enum DataType {
		STATE, CTD, ADCP, AIS
	}

	/**
	 * Liquid Robotics data portal URL to query wg sensors data
	 */
	private final String URL = "https://dataportal.liquidr.net/firehose/?";

	/**
	 * May 1st 2018 - The begin date for the data query
	 */
	private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

	/**
	 * WG SV3-127 id in the data portal
	 */
	private final String vids = "1315596328";

	
	 @PostConstruct
	 @Scheduled(fixedRate = 60_000)
	 public void updateWGData() {
		 System.out.println(getData("CTD", "-5m"));
	 }
	
	public WGDownloader() {
		System.out.println("USER: "+user);
		authenticate(user, password);
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

	private void authenticate(String user, String pass) {
		try {
			Authenticator.setDefault(new Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(user, pass.toCharArray());
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
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
			conn.setRequestMethod("POST");
			conn.connect();
			int responseCode = conn.getResponseCode();
			System.out.println("RESPONSE: " + responseCode);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			FileCopyUtils.copy(conn.getInputStream(), baos);

			if (responseCode != HttpURLConnection.HTTP_OK) {
				System.err.println(baos.toString());
				return null;
			}

			return baos.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static void main(String args[]) {
		
	}
}