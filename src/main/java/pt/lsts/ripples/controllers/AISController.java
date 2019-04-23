package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;
import java.time.Instant;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.AISShip;
import pt.lsts.ripples.services.AISHubFetcher;
import pt.lsts.ripples.repo.AISRepository;

@RestController
public class AISController {
    
	@Autowired
	AISRepository repo;
	
	@Autowired
	AISHubFetcher aisUpdater;

	
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
	

}