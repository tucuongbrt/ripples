package pt.lsts.ripples.controllers;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.AISShip;
import pt.lsts.ripples.repo.AISRepository;
import pt.lsts.ripples.services.AISHubFetcher;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class AISController {
    
	@Autowired
	AISRepository repo;
	
	@Autowired
	AISHubFetcher aisUpdater;

	@Autowired
	WebSocketsController wsController;

	
	@RequestMapping(path = { "/ais/all", "/ais/all/" }, method = RequestMethod.GET)
	public List<AISShip> listAllAIS() {
		ArrayList<AISShip> aisList = new ArrayList<>();
		aisUpdater.fetchAISHub();
		repo.findAll().forEach(aisList::add);
		return aisList;
	}

	@RequestMapping(path = { "/ais", "/ais/" }, method = RequestMethod.GET)
	public List<AISShip> listAIS() {
		Instant aDayAgo = Instant.now().minus(Duration.ofHours(24));
		Date aDayAgoDate = Date.from(aDayAgo);
		ArrayList<AISShip> aisList = new ArrayList<>();
		//aisUpdater.fetchAISHub();
		repo.findByTimestampAfter(aDayAgoDate).forEach(aisList::add);
		return aisList;
	}

	@PostMapping(path = {"/ais", "/ais/"}, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updateAIS(@RequestBody ArrayList<AISShip> aisShips) {
		ArrayList<AISShip> newAISShips = filterNewAISShips(aisShips);
		repo.saveAll(newAISShips);
		wsController.sendAISUpdateFromServerToClient(newAISShips);
		return new ResponseEntity<>(new HTTPResponse("success", aisShips.size() + " ais ships updated"), HttpStatus.OK);
	}
	
	private ArrayList<AISShip> filterNewAISShips(ArrayList<AISShip>aisShips) {
		ArrayList<AISShip> newAISShips = new ArrayList<>();
		aisShips.forEach(s -> {
			Optional<AISShip> optAIS = repo.findById(s.getMmsi());
			if (optAIS.isPresent()) {
				if (optAIS.get().getTimestamp().before(s.getTimestamp())) {
					newAISShips.add(s);
				}
			} else {
				newAISShips.add(s);
			}
		});
		return newAISShips;
	}

}