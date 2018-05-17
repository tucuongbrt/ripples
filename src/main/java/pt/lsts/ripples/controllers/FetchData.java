package pt.lsts.ripples.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.util.DateUtil;

@RestController()
public class FetchData {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/data/{vehicle}.csv", produces = "text/csv")
	public void getCsv(@RequestParam(defaultValue = "-24h") String start,
			@PathVariable String vehicle, HttpServletResponse response)
					throws IOException {
		response.getWriter().write("vehicle,latitude,longitude,timestamp,salinity,temperature,conductivity,pressure\n");
		Date startDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(startDate);
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);

		for (EnvDatum d : data) {
			response.getWriter().write(String.join(",", d.getSource(), String.valueOf(d.getLatitude()),
					String.valueOf(d.getLongitude()), String.valueOf(d.getTimestamp()),
					String.valueOf(d.getValues().get("salinity")), String.valueOf(d.getValues().get("temperature")),
					String.valueOf(d.getValues().get("conductivity")), String.valueOf(d.getValues().get("pressure"))));
			response.getWriter().write('\n');
		}

		response.getWriter().close();
	}

	@RequestMapping(value = "/data/{vehicle}.geojson", produces = "text/csv")
	public void getGeoJson(@RequestParam(defaultValue = "-24h") String start, @PathVariable String vehicle,
			HttpServletResponse response) throws IOException {
		Date startDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (vehicle.equals("any"))
			data = repo.findByTimestampAfterOrderByTimestampDesc(startDate);
		else
			data = repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);
		ConcurrentHashMap<String, ArrayList<Double[]>> locations = new ConcurrentHashMap<>();

		for (EnvDatum d : data) {
			locations.putIfAbsent(d.getSource(), new ArrayList<>());
			locations.get(d.getSource()).add(new Double[] { d.getLongitude(), d.getLatitude() });

		}

		response.setStatus(200);
		response.setContentType("application/vnd.geo+json");
		response.getWriter().write(
				"{\"type\": \"FeatureCollection\",\n"+
				"\"features\": [\n");

		boolean firstFeature = true;
		for (String name : locations.keySet()) {
			if (!firstFeature)
				response.getWriter().write(",\n");
			firstFeature = false;
			response.getWriter().write(
					"{\"type\": \"Feature\",\n"+
							"\"properties\": {\"system\": \""+ name + "\"},\n"+
							"\"geometry\": { \"type\": \"LineString\", \"coordinates\": [");
			boolean first = true;
			for (Double[] coords : locations.get(name)) {
				if (first)
					response.getWriter().write("[" + coords[0] + "," + coords[1] + "]");
				else
					response.getWriter().write(", [" + coords[0] + "," + coords[1] + "]");
				first = false;
			}
			response.getWriter().write("]}}");
		}
		response.getWriter().write("]}\n");
		response.getWriter().close();
	}

	@RequestMapping(value = "/data.json", produces = "application/json")
	public Iterable<EnvDatum> getData(@RequestParam(defaultValue = "-24h") String start,
			@RequestParam(defaultValue = "wg-sv3-127") String vehicle, HttpServletResponse response) {
		Date startDate = DateUtil.parse(start);

		if (startDate == null)
			return repo.findBySource(vehicle);
		else
			return repo.findBySourceAndTimestampAfterOrderByTimestampDesc(vehicle, startDate);
	}



}
