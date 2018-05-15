package pt.lsts.wg.wgviewer.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;

@Component
public class SailDroneDownloader {

	@Autowired
	private EnvDataRepository repo;

	private final Logger logger = LoggerFactory.getLogger(SailDroneDownloader.class);

	private final String URL = "https://www.pmel.noaa.gov/sdig/soi/erddap/tabledap/soi_saildrone.csv0?trajectory,longitude,latitude,time,SAL_MEAN,COND_MEAN,TEMP_CTD_MEAN&time%3E=";
	enum PART_NAMES {
		trajectory,longitude,latitude,time,SAL_MEAN,COND_MEAN,TEMP_CTD_MEAN
	};
	
	@PostConstruct
	public void initialData() {
		// if there is no data...
		if (!repo.findBySource("saildrone-1001").iterator().hasNext())
			getDataSince(LocalDate.of(2018, 04, 01).atStartOfDay(ZoneId.of("UTC")).toInstant());		
	}
	
	@Scheduled(fixedRate = 60_000)
	public void updateDataPeriodically() {
		getDataSince(Instant.ofEpochMilli(System.currentTimeMillis()-60_000));
	}	

	public void getDataSince(Instant startTime) {
		logger.info("Getting data from "+URL + startTime);
		try {
			HttpURLConnection conn = (HttpURLConnection) new java.net.URL(URL + startTime).openConnection();
			if (conn.getResponseCode() != 200) {
				logger.error("Error "+conn.getResponseCode());
				return;
			}
			BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));

			String line = reader.readLine();
			while (line != null) {
				String[] parts = line.split(",");
				String source = "saildrone-"+parts[PART_NAMES.trajectory.ordinal()].replaceAll("\\.0", "");
				EnvDatum datum = new EnvDatum();
				datum.setSource(source);
				datum.setLatitude(Double.valueOf(parts[PART_NAMES.latitude.ordinal()]));
				datum.setLongitude(Double.valueOf(parts[PART_NAMES.longitude.ordinal()]));
				datum.setTimestamp(Date.from(Instant.parse(parts[PART_NAMES.time.ordinal()])));
				datum.getValues().put("salinity", Double.valueOf(parts[PART_NAMES.SAL_MEAN.ordinal()]));
				datum.getValues().put("conductivity", Double.valueOf(parts[PART_NAMES.COND_MEAN.ordinal()]));
				datum.getValues().put("temperature", Double.valueOf(parts[PART_NAMES.TEMP_CTD_MEAN.ordinal()]));
				repo.save(datum);
				line = reader.readLine();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		SailDroneDownloader downloader = new SailDroneDownloader();
		downloader.getDataSince(LocalDate.of(2018, 05, 10).atStartOfDay(ZoneId.of("UTC")).toInstant());
	}
}
