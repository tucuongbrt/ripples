package pt.lsts.ripples.jobs;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ConnectException;
import java.net.Socket;
import java.util.Date;
import java.util.LinkedHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.util.RipplesUtils;

@Component
public class FalkorUnderwayData implements Runnable {

	@Value("${falkor.underway.host:10.23.10.202}")
	private String host = "";

	@Value("${falkor.underway.port:35001}")
	private int port = 0;
	
	@Value("${falkor.underway.active:false}")
	private boolean active;
	
	private Thread thread;

	private LinkedHashMap<String, Double> data = new LinkedHashMap<>();
	private Long lastMeasurement = System.currentTimeMillis();
	private double lat, lon;

	@Autowired
	private RipplesUtils ripples;

	private final Logger logger = LoggerFactory.getLogger(FalkorUnderwayData.class);

	public FalkorUnderwayData() {
		this.thread = new Thread(this);
		this.thread.start();
	}

	@Override
	public void run() {
		while (active) {
			try (Socket so = new Socket(host, port);
					BufferedReader reader = new BufferedReader(new InputStreamReader(so.getInputStream()))) {

				String line = reader.readLine();
				while (line != null) {
					process(line);
					line = reader.readLine();
					if (System.currentTimeMillis() - lastMeasurement > 60000) {
						ripples.setPosition(ripples.getOrCreate("falkor"), lat, lon, new Date(), true);
						ripples.setReceivedData(ripples.getOrCreate("falkor"), lat, lon, new Date(), data);
						lastMeasurement = System.currentTimeMillis();
						logger.info("Stored data from Falkor.");
					}
				}
			} catch (ConnectException e){
				logger.error("Can not connect to falkor underway: " + e.getMessage());
				e.printStackTrace();
			} 
			catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private void processSeaWaterSystem(String line) {
		line = line.replaceAll("\\w+\\d?= ", "");
		String[] parts = line.split("[, =]+");
		data.put("temperature", Double.parseDouble(parts[0]));
		data.put("conductivity", Double.parseDouble(parts[1]));
		data.put("salinity", Double.parseDouble(parts[2]));
	}

	private void process(String line) {

		if (line.startsWith("t1=")) {
			processSeaWaterSystem(line);
		} else if (line.startsWith("$GPGGA")) {
			processGGA(line);
		}
	}

	private static double Latitude2Decimal(String lat, String NS) {
		double med = Double.parseDouble(lat.substring(2)) / 60.0f;
		med += Float.parseFloat(lat.substring(0, 2));
		if (NS.startsWith("S")) {
			med = -med;
		}
		return med;
	}

	private static double Longitude2Decimal(String lon, String WE) {
		double med = Double.parseDouble(lon.substring(3)) / 60.0f;
		med += Float.parseFloat(lon.substring(0, 3));
		if (WE.startsWith("W")) {
			med = -med;
		}
		return med;
	}

	private void processGGA(String line) {
		String[] parts = line.split(",");
		this.lat = Latitude2Decimal(parts[2], parts[3]);
		this.lon = Longitude2Decimal(parts[4], parts[5]);
	}
}
