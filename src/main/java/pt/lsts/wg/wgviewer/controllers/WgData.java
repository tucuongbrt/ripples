package pt.lsts.wg.wgviewer.controllers;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.wg.wgviewer.domain.EnvDatum;
import pt.lsts.wg.wgviewer.repo.EnvDataRepository;

@RestController()
public class WgData {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/wgdata.csv", produces = "text/csv")
	public void getCsv(@RequestParam(defaultValue="-24h") String start, HttpServletResponse response) throws IOException {
		response.getWriter().write("vehicle,latitude,longitude,timestamp,salinity,temperature,conductivity,pressure\n");
		Date startDate = parse(start);
		List<EnvDatum> data;
		
		if (startDate == null)
			data = repo.findBySource("wg-sv3-127");
		else
			data = repo.findBySourceAndTimestampAfter("wg-sv3-127", startDate);
		
		for (EnvDatum d : data) {
			response.getWriter().write(String.join(",", d.getSource(), String.valueOf(d.getLatitude()),
					String.valueOf(d.getLongitude()), String.valueOf(d.getTimestamp()),
					String.valueOf(d.getValues().get("salinity")), String.valueOf(d.getValues().get("temperature")),
					String.valueOf(d.getValues().get("conductivity")), String.valueOf(d.getValues().get("pressure"))));
			response.getWriter().write('\n');
		}

		response.getWriter().close();
	}
	
	@RequestMapping(value = "/wgdata.json", produces = "application/json")
	public Iterable<EnvDatum> getData(@RequestParam(defaultValue="-24h") String start, HttpServletResponse response) {
		Date startDate = parse(start);
		
		if (startDate == null)
			return repo.findBySource("wg-sv3-127");
		else
			return repo.findBySourceAndTimestampAfter("wg-sv3-127", startDate);
	}
	
	private Date parse(String start) {
		
		if (start.endsWith("s") && start.startsWith("-")) {
			try {
				int secs = Integer.parseInt(start.substring(1, start.length()-1));
				return new Date(System.currentTimeMillis() - secs * 1_000);
			}
			catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}
		
		if (start.endsWith("m") && start.startsWith("-")) {
			try {
				int mins = Integer.parseInt(start.substring(1, start.length()-1));
				return new Date(System.currentTimeMillis() - mins * 60_000);
			}
			catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}
		
		if (start.endsWith("h") && start.startsWith("-")) {
			try {
				int hours = Integer.parseInt(start.substring(1, start.length()-1));
				return new Date(System.currentTimeMillis() - hours * 60_000 * 60);
			}
			catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}
		
		if (start.endsWith("d") && start.startsWith("-")) {
			try {
				int days = Integer.parseInt(start.substring(1, start.length()-1));
				return new Date(System.currentTimeMillis() - days * 60_000 * 60 * 24);
			}
			catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}
		try {
			LocalDate ld = LocalDate.parse(start);
			return Date.from(ld.atStartOfDay(ZoneId.of("UTC")).toInstant());
		}
		catch (Exception e) {
			return new Date(System.currentTimeMillis() - 24 * 3600_000);
		}		
	}
}
