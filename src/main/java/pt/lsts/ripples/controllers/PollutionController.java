package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.shared.ExternalServer;
import pt.lsts.ripples.domain.shared.PollutionLocation;
import pt.lsts.ripples.repo.main.ExternalServerRepository;
import pt.lsts.ripples.repo.main.PollutionDataRepository;
import pt.lsts.ripples.util.HTTPResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@RestController
public class PollutionController {

    @Autowired
    WebSocketsController wsController;

    @Autowired
    PollutionDataRepository repo;

    @Autowired
    ExternalServerRepository repoServer;

    @RequestMapping(path = { "/pollution", "/pollution/" }, method = RequestMethod.GET)
    public List<PollutionLocation> listPollution() {
        ArrayList<PollutionLocation> missionList = new ArrayList<>();
        repo.findAll().forEach(missionList::add);
        return missionList;
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @PostMapping(path = { "/pollution/{id}" }, consumes = "application/json")
    public ResponseEntity<HTTPResponse> createPollution(@RequestBody PollutionLocation asset, @PathVariable String id) {

        Optional<PollutionLocation> optPollutionMarker = repo.findById(Long.valueOf(id));
        if (optPollutionMarker.isPresent()) {
            PollutionLocation updatePollutionInfo = optPollutionMarker.get();
            updatePollutionInfo.setDescription(asset.getDescription());
            updatePollutionInfo.setRadius(asset.getRadius());
            updatePollutionInfo.setLatitude(asset.getLatitude());
            updatePollutionInfo.setLongitude(asset.getLongitude());
            repo.save(updatePollutionInfo);
            wsController.sendPollutionAssetFromServerToClients(updatePollutionInfo);
        } else {
            repo.save(asset);
            wsController.sendPollutionAssetFromServerToClients(asset);
        }

        return new ResponseEntity<>(new HTTPResponse("success", "Added pollution marker"), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @PostMapping(path = { "/pollution/{id}/{status}" })
    public ResponseEntity<HTTPResponse> updatePollutionStatus(@PathVariable String id, @PathVariable String status) {

        Optional<PollutionLocation> optPollutionMarker = repo.findById(Long.valueOf(id));
        if (optPollutionMarker.isPresent()) {
            PollutionLocation updatePollutionInfo = optPollutionMarker.get();
            updatePollutionInfo.setStatus(status);
            repo.save(updatePollutionInfo);
            wsController.sendPollutionAssetFromServerToClients(updatePollutionInfo);
        } else {
            return new ResponseEntity<>(new HTTPResponse("error", "Pollution status cannot be updated"), HttpStatus.OK);
        }

        return new ResponseEntity<>(new HTTPResponse("success", "Pollution status updated"), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @PostMapping(path = { "/pollution/remove/{id}", "/pollution/remove/{id}/" })
    public ResponseEntity<HTTPResponse> deletePollution(@PathVariable String id) {
        repo.deleteById(Long.valueOf(id));
        return new ResponseEntity<>(new HTTPResponse("Success", "Pollution marker was deleted"), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @RequestMapping(path = { "/pollution/serverAll", "/pollution/serverAll/" }, method = RequestMethod.GET)
    public List<ExternalServer> pollutionServerAll() {
        ArrayList<ExternalServer> serverList = new ArrayList<>();
        repoServer.findAll().forEach(serverList::add);
        return serverList;
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @GetMapping(path = { "/pollution/server", "/pollution/server/" })
    public @ResponseBody String pollutionServer() {
        Optional<ExternalServer> opt = repoServer.findByName("ramp_pollution");
        String serverUrl = "";
        if (opt.isPresent()) {
            System.out.println(opt.get().getIP());
            serverUrl = opt.get().getIP();
        }
        return "{\"url\":\"" + serverUrl + "\"}";
    }

    @PreAuthorize("hasRole('SCIENTIST')")
    @PostMapping(path = { "/pollution/server/{ip}" })
    public ResponseEntity<HTTPResponse> updatePollutionServer(@PathVariable String ip) {

        Optional<ExternalServer> opt = repoServer.findByName("ramp_pollution");
        if (opt.isPresent()) {
            ExternalServer server = opt.get();
            server.setIP(ip);
            repoServer.save(server);
            return new ResponseEntity<>(new HTTPResponse("success", "Pollution server updated"), HttpStatus.OK);
        } else {
            System.out.println("NEW");
            ExternalServer newServer = new ExternalServer("ramp_pollution", ip);
            repoServer.save(newServer);
            return new ResponseEntity<>(new HTTPResponse("success", "Pollution server updated"), HttpStatus.OK);
        }
    }
}