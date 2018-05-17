package pt.lsts.ripples.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.controllers.PositionsController.SystemPosition;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.repo.PositionsRepository;
import pt.lsts.ripples.services.FirebaseAdapter;

@Component
public class SailDroneDownloader {

	@Autowired
	private EnvDataRepository repo;
	
	@Autowired
	private PositionsRepository posRepo;
	
	@Autowired
	private FirebaseAdapter firebase;
	
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
		
		List<EnvDatum> datum1 = repo.findTopBySourceOrderByTimestampDesc("saildrone-1001");
		List<EnvDatum> datum2 = repo.findTopBySourceOrderByTimestampDesc("saildrone-1004");
		
		if (!datum1.isEmpty()) {
			AssetPosition pos = new AssetPosition();
			pos.setLat(datum1.get(0).getLatitude());
			pos.setLon(datum1.get(0).getLongitude());
			pos.setName(datum1.get(0).getSource());
			pos.setTimestamp(datum1.get(0).getTimestamp());
			pos.setImcId(10251);
			posRepo.save(pos);		
			firebase.updateFirebase(pos);
		}
		
		if (!datum2.isEmpty()) {
			AssetPosition pos = new AssetPosition();
			pos.setLat(datum2.get(0).getLatitude());
			pos.setLat(datum2.get(0).getLongitude());
			pos.setName(datum2.get(0).getSource());
			pos.setTimestamp(datum2.get(0).getTimestamp());
			pos.setImcId(10252);
			posRepo.save(pos);		
			firebase.updateFirebase(pos);
		}
		
	}
	
	@Scheduled(fixedRate = 60_000)
	public void updateDataPeriodically() {
		
		List<EnvDatum> lastData = repo.findTopBySourceOrderByTimestampDesc("saildrone-1001");
		if (lastData.isEmpty()) {
			getDataSince(LocalDate.of(2018, 04, 01).atStartOfDay(ZoneId.of("UTC")).toInstant());
		}
		else {
			getDataSince(lastData.get(0).getTimestamp().toInstant());
		}
			
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
