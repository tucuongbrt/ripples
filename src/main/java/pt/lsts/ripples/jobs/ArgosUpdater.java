package pt.lsts.ripples.jobs;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.services.AssetInfoService;
import pt.lsts.ripples.util.RipplesUtils;

@Service
public class ArgosUpdater {

	@Value("${argos.minLon:-140}")
	double longitude_min;

	@Value("${argos.maxLon:-120}")
	double longitude_max;

	@Value("${argos.minLat:20}")
	double latitude_min;

	@Value("${argos.maxLat:40}")
	double latitude_max;

	@Value("${argos.daysToFetch:10}")
	int daysToFetch;

	@Value("${argos.url:http://www.ifremer.fr/erddap/tabledap/ArgoFloats.csv?date_update,platform_number,latitude,longitude,pres,temp,psal}")
	String argosUrl;

	@Autowired
	AssetInfoService infoServ;

	@Autowired
	RipplesUtils ripples;

	private enum ARGOS_COLUMNS {
		date_update, platform_number, latitude, longitude, pres, temp, psal
	};

	@PostConstruct
	public void updateArgos() {

		StringBuilder sb = new StringBuilder(argosUrl);
		sb.append("&time>=" + Instant.now().minus(daysToFetch, ChronoUnit.DAYS));
		sb.append("&latitude>=" + latitude_min);
		sb.append("&latitude<=" + latitude_max);
		sb.append("&longitude>=" + longitude_min);
		sb.append("&longitude<=" + longitude_max);

		Logger.getLogger(getClass().getSimpleName()).info("Fetching ARGOS data from " + sb.toString());
		HttpURLConnection conn;
		try {
			URL url = new URL(sb.toString());
			conn = (HttpURLConnection) url.openConnection();
		} catch (Exception e) {
			e.printStackTrace();
			return;
		}

		ConcurrentHashMap<Integer, Pair<Instant, String[]>> mostRecent = new ConcurrentHashMap<>();

		try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
			// ignore first two lines
			String line = reader.readLine();
			line = reader.readLine();

			while ((line = reader.readLine()) != null) {
				String[] parts = line.split(",");

				int id = Integer.valueOf(parts[ARGOS_COLUMNS.platform_number.ordinal()]);
				Instant time = Instant.parse(parts[ARGOS_COLUMNS.date_update.ordinal()]);

				if (!mostRecent.containsKey(id) || mostRecent.get(id).getFirst().isBefore(time)) {
					mostRecent.put(id, Pair.of(time, parts));
				}
			}

			for (Entry<Integer, Pair<Instant, String[]>> e : mostRecent.entrySet()) {
				LinkedHashMap<String, String> measures = new LinkedHashMap<>();
				measures.put("salinity", e.getValue().getSecond()[ARGOS_COLUMNS.psal.ordinal()]);
				measures.put("temperature", e.getValue().getSecond()[ARGOS_COLUMNS.temp.ordinal()]);
				measures.put("pressure", e.getValue().getSecond()[ARGOS_COLUMNS.pres.ordinal()]);
				double lat = Double.valueOf(e.getValue().getSecond()[ARGOS_COLUMNS.latitude.ordinal()]);
				double lon = Double.valueOf(e.getValue().getSecond()[ARGOS_COLUMNS.longitude.ordinal()]);
				
				/*try {
				LinkedHashMap<String, Double> data = new LinkedHashMap<>();
				for (Entry<String, String> el : measures.entrySet())
					data.put(el.getKey(), Double.parseDouble(el.getValue()));
				
				SystemAddress addr = ripples.getOrCreate("argos_"+e.getKey());
				ripples.setPosition(addr, lat, lon, Date.from(e.getValue().getFirst()), false);
				ripples.setReceivedData(addr, lat, lon, Date.from(e.getValue().getFirst()), data);
				}
				catch (Exception ex) {
					ex.printStackTrace();
				}*/
				infoServ.updateArgosAsset(e.getKey(), measures, Date.from(e.getValue().getFirst()), lat, lon);
			}

		} catch (IOException e) {
			e.printStackTrace();
			return;
		}

	}
}
