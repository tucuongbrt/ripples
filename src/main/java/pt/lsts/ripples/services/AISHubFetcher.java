package pt.lsts.ripples.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pt.lsts.aismanager.api.AisContactManager;
import pt.lsts.ripples.domain.wg.AISShip;
import pt.lsts.ripples.repo.main.AISRepository;

import javax.annotation.PostConstruct;
import java.net.URL;
import java.text.ParseException;
import java.util.Scanner;


@Component
public class AISHubFetcher {


	@Autowired
	AISRepository repo;

	private final Logger logger = LoggerFactory.getLogger(AISHubFetcher.class);
	
	private static long lastRequest;
	
	@Value("${ais.username}")
	private String USERNAME;

	@Value("${ais.minlat}")
	private String latMin;

	@Value("${ais.maxlat}")
	private String latMax;

	@Value("${ais.minlng}")
	private String lonMin;

	@Value("${ais.maxlng}")
	private String lonMax;
	
	private String url;
	
	@PostConstruct
	public void init() {
		url = "http://data.aishub.net/ws.php?username=" + USERNAME
				+ "&format=1&output=csv&latmin=" + latMin + "&lonmin=" + lonMin + "&latmax=" 
				+ latMax + "&lonmax=" + lonMax;
		logger.info("AISHubFetcher url: " + url);
		lastRequest = 0;
		fetchAISHub();
	}
	
	
	public void fetchAISHub() {
		
		if (System.currentTimeMillis() - lastRequest < 60 * 1000)
			return;
		
		try {
			URL aishub = new URL(url);
			 Scanner scanner = new Scanner(aishub.openStream());
			 scanner.useDelimiter("\n");
			 int count = 0;
			 while (scanner.hasNext()) {
				 String line = scanner.next().trim();
				 if (line.startsWith("\"") || line.endsWith("!"))
					 continue;
				 try {
					 AISShip aisShip = AISShip.parseCSV(line);
					 saveShipSnapshot(aisShip);
					 repo.save(aisShip);
					 
					 count++;
				 }
				 catch (Exception e) {
					 e.printStackTrace();
				}
			 }
			 lastRequest = System.currentTimeMillis();
			 logger.info("Read "+count+" ships");
			 scanner.close();
		}
		catch (Exception e) {
			e.printStackTrace();		
		}
	}
	
	private void saveShipSnapshot(AISShip ais) throws ParseException {
		AisContactManager.getInstance().setShipPosition(
				ais.getMmsi(),
				ais.getSog(),
				ais.getCog(),
				ais.getHeading(),
				ais.getLatitudeRads(),
				ais.getLongitudeRads(),
				ais.getTimestamp().getTime(),
				ais.getName());
	}
}