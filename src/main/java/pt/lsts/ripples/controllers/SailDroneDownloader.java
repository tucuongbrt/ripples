package pt.lsts.ripples.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.jobs.UpdateAddresses;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.util.RipplesUtils;

@Component
public class SailDroneDownloader {

	@Autowired
	private EnvDataRepository repo;

	@Autowired
	private RipplesUtils ripples;

	@SuppressWarnings("unused")
	@Autowired
	private UpdateAddresses addrUpdater;
	
	@Value("${skip.db.initialization:false}")
	boolean skip_initialization;

	
	private final Logger logger = LoggerFactory.getLogger(SailDroneDownloader.class);

	private final String URL = "https://www.pmel.noaa.gov/sdig/soi/erddap/tabledap/soi_saildrone.csv0?trajectory,longitude,latitude,time,SAL_MEAN,COND_MEAN,TEMP_CTD_MEAN&time%3E";

	enum PART_NAMES {
		trajectory, longitude, latitude, time, SAL_MEAN, COND_MEAN, TEMP_CTD_MEAN
	};

	@PostConstruct
	public void initialData() {
		
		if (skip_initialization) {
			logger.info("Skipping DB initialization");
			return;
		}

		List<EnvDatum> lastData = repo.findTopBySourceOrderByTimestampDesc("saildrone-1001");
		if (lastData.isEmpty()) {
			getDataSince(LocalDate.of(2018, 04, 01).atStartOfDay(ZoneId.of("UTC")).toInstant());
		} else {
			getDataSince(lastData.get(0).getTimestamp().toInstant());
		}
	}

	@Scheduled(fixedRate = 60_000)
	public void updateDataPeriodically() {

		List<EnvDatum> lastData = repo.findTopBySourceOrderByTimestampDesc("saildrone-1001");
		if (lastData.isEmpty()) {
			getDataSince(LocalDate.of(2018, 04, 01).atStartOfDay(ZoneId.of("UTC")).toInstant());
		} else {
			getDataSince(lastData.get(0).getTimestamp().toInstant());
		}

	}

	public void getDataSince(Instant startTime) {
		logger.info("Getting data from " + URL + startTime);
		try {
			HttpURLConnection conn = (HttpURLConnection) new java.net.URL(URL + startTime).openConnection();
			if (conn.getResponseCode() != 200) {
				logger.error("Error " + conn.getResponseCode());
				return;
			}
			BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
			String line = reader.readLine();

			ConcurrentHashMap<String, SystemAddress> addrs = new ConcurrentHashMap<>();
			
			while (line != null) {
				String[] parts = line.split(",");
				String source = "saildrone-" + parts[PART_NAMES.trajectory.ordinal()].replaceAll("\\.0", "");
				SystemAddress addr = addrs.getOrDefault(source, ripples.getOrCreate(source));
				
				LinkedHashMap<String, Double> vals = new LinkedHashMap<>();
				vals.put("salinity", Double.valueOf(parts[PART_NAMES.SAL_MEAN.ordinal()]));
				vals.put("conductivity", Double.valueOf(parts[PART_NAMES.COND_MEAN.ordinal()]));
				vals.put("temperature", Double.valueOf(parts[PART_NAMES.TEMP_CTD_MEAN.ordinal()]));
				ripples.setReceivedData(addr, Double.valueOf(parts[PART_NAMES.latitude.ordinal()]),
						Double.valueOf(parts[PART_NAMES.longitude.ordinal()]),
						Date.from(Instant.parse(parts[PART_NAMES.time.ordinal()])), vals);
				line = reader.readLine();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public static void main(String[] args) {
		SailDroneDownloader downloader = new SailDroneDownloader();
		downloader.getDataSince(LocalDate.of(2018, 05, 19).atStartOfDay(ZoneId.of("UTC")).toInstant());
	}
}
