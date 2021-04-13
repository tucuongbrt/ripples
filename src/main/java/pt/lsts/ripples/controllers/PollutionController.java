package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.shared.PollutionLocation;
import pt.lsts.ripples.repo.main.PollutionDataRepository;
import pt.lsts.ripples.util.HTTPResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
public class PollutionController {
    
    @Autowired
	WebSocketsController wsController;

    @Autowired
    PollutionDataRepository repo;

    @RequestMapping(path = { "/pollution", "/pollution/" }, method = RequestMethod.GET)
    public List<PollutionLocation> listPollution() {
		ArrayList<PollutionLocation> missionList = new ArrayList<>();
		repo.findAll().forEach(missionList::add);
		return missionList;
	}

    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST')")
    @PostMapping(path = { "/pollution", "/pollution/" }, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updatePollution(@RequestBody PollutionLocation asset) {
        
        repo.save(asset);
        wsController.sendPollutionAssetFromServerToClients(asset);

        return new ResponseEntity<>(new HTTPResponse("success", "Added pollution marker"), HttpStatus.OK);
   
	}
}
