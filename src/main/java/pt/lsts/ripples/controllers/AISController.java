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
import org.springframework.web.bind.annotation.DeleteMapping;

import pt.lsts.ripples.domain.shared.AISShip;
import pt.lsts.ripples.repo.main.AISRepository;
import pt.lsts.ripples.services.AISHubFetcher;

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
		aisUpdater.fetchAISHub();
		repo.findByTimestampAfter(aDayAgoDate).forEach(aisList::add);
		return aisList;
	}

	@PostMapping(path = {"/ais", "/ais/"}, consumes = "application/json", produces = "text/plain")
	public ResponseEntity<String> updateAIS(@RequestBody AISShip aisShip) {
		AISShip newAISShip = filterNewAISShip(aisShip);
		repo.save(newAISShip);
		wsController.sendAISUpdateFromServerToClient(newAISShip);
		//send to Neptus

		return new ResponseEntity<>("Success, a ship has been updated", HttpStatus.OK);
	}
	
	private AISShip filterNewAISShip(AISShip aisShip) {
		AISShip newAISShip = null;
		Optional<AISShip> optAIS = repo.findById(aisShip.getMmsi());
		if (optAIS.isPresent()) {
			if (optAIS.get().getTimestamp().before(aisShip.getTimestamp())) {
				newAISShip = aisShip;
			}
		} else {
			newAISShip = aisShip;
		}
		return newAISShip;
	}

	/*
	@PostMapping(path = { "/ais/realTime", "/ais/realTime/" }, consumes="application/json", produces ="text/plain")
	public ResponseEntity<String> updateAISRealTime(@RequestBody AISShip aisShip) {
		AISShip newAISShip = filterNewAISShip(aisShip);
		repo.save(newAISShip);
		//wsController.sendAISUpdateFromServerToClient(newAISShip);
		wsController.sendAISRealTimeUpdateFromServerToClient(newAISShip);
		return new ResponseEntity<>("Success, a ship has been updated", HttpStatus.OK);
	}
	*/
	
	@DeleteMapping(path = {"/ais" , "/ais/"} )
	public ResponseEntity<String> deleteShip(){
		repo.deleteById(204261999);
		return new ResponseEntity<>("Success, a ship has been removed", HttpStatus.OK);
	}


}