package pt.lsts.wg.wgviewer.controllers;

import java.io.IOException;

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
	public void getCsv(HttpServletResponse response) throws IOException {
		response.getWriter().write("vehicle,latitude,longitude,timestamp,salinity,temperature,conductivity,pressure\n");
		
		for (EnvDatum d : repo.findBySource("wg-sv3-127")) {
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
		
		System.out.println(start);
		return repo.findBySource("wg-sv3-127");
	}
}
