package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.AISShip;
import pt.lsts.ripples.jobs.AISHubFetcher;
import pt.lsts.ripples.repo.AISRepository;

@RestController
public class AISController {
    
	@Autowired
	AISRepository repo;
	
	@Autowired
	AISHubFetcher aisUpdater;

	
	@RequestMapping(path = { "/ais/", "/ais" }, method = RequestMethod.GET)
	public List<AISShip> listAIS() {
		ArrayList<AISShip> aisList = new ArrayList<>();
		aisUpdater.fetchAISHub();
		repo.findAll().forEach(aisList::add);
		return aisList;
	}
	

}