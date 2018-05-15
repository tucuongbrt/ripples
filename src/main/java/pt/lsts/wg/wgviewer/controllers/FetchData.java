package pt.lsts.wg.wgviewer.controllers;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;
import pt.lsts.wg.wgviewer.util.DateUtil;

@RestController()
public class FetchData {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/data.csv", produces = "text/csv")
	public void getCsv(@RequestParam(defaultValue = "-24h") String start,
			@RequestParam(defaultValue = "wg-sv3-127") String vehicle, HttpServletResponse response)
			throws IOException {
		response.getWriter().write("vehicle,latitude,longitude,timestamp,salinity,temperature,conductivity,pressure\n");
		Date startDate = DateUtil.parse(start);
		List<EnvDatum> data;

		if (startDate == null)
			data = repo.findBySource(vehicle);
		else
			data = repo.findBySourceAndTimestampAfter(vehicle, startDate);

		for (EnvDatum d : data) {
			response.getWriter().write(String.join(",", d.getSource(), String.valueOf(d.getLatitude()),
					String.valueOf(d.getLongitude()), String.valueOf(d.getTimestamp()),
					String.valueOf(d.getValues().get("salinity")), String.valueOf(d.getValues().get("temperature")),
					String.valueOf(d.getValues().get("conductivity")), String.valueOf(d.getValues().get("pressure"))));
			response.getWriter().write('\n');
		}

		response.getWriter().close();
	}

	@RequestMapping(value = "/data.json", produces = "application/json")
	public Iterable<EnvDatum> getData(@RequestParam(defaultValue = "-24h") String start,
			@RequestParam(defaultValue = "wg-sv3-127") String vehicle, HttpServletResponse response) {
		Date startDate = DateUtil.parse(start);

		if (startDate == null)
			return repo.findBySource(vehicle);
		else
			return repo.findBySourceAndTimestampAfter(vehicle, startDate);
	}

	
	
}
