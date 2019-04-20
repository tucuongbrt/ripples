package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiCommand.COMMAND;
import pt.lsts.imc.SoiCommand.TYPE;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.Plan;
import pt.lsts.ripples.domain.soi.AwarenessData;
import pt.lsts.ripples.domain.soi.PotentialCollision;
import pt.lsts.ripples.domain.soi.NewPlanBody;
import pt.lsts.ripples.domain.soi.VehicleRiskAnalysis;
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.exceptions.AssetNotFoundException;
import pt.lsts.ripples.exceptions.SendSoiCommandException;
import pt.lsts.ripples.iridium.SoiInteraction;
import pt.lsts.ripples.services.AISHubFetcher;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.repo.VertProfilesRepo;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.services.SoiAwareness;
import pt.lsts.ripples.util.HTTPResponse;
import pt.lsts.ripples.util.Pair;

@RestController
public class SoiController {

	@Autowired
	AssetsRepository repo;
	
	@Autowired
	CollisionForecastService collisionService;

	@Autowired
	VertProfilesRepo vertProfiles;

	@Autowired
	AISHubFetcher aisUpdater;
	
	@Autowired
	SoiInteraction soiInteraction;

	@Autowired
	SoiAwareness soiAwareness;

	private static Logger logger = LoggerFactory.getLogger(SoiController.class);

	@RequestMapping(path = { "/soi/", "/soi" }, method = RequestMethod.GET)
	public List<Asset> listAssets() {
		ArrayList<Asset> assets = new ArrayList<>();
		repo.findAll().forEach(assets::add);
		return assets;
	}
	
	@RequestMapping(path = { "/soi/profiles", "/soi/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listProfiles() {
		ArrayList<VerticalProfileData> profs = new ArrayList<>();
		vertProfiles.findAll().forEach(profs::add);
		return profs;
	}
	
	@RequestMapping(path = { "/soi/risk", "/soi/risk/" }, method = RequestMethod.GET)
	@ResponseBody
	public HashSet<PotentialCollision> riskAnalysis() {
		aisUpdater.fetchAISHub();
		return collisionService.updateCollisions();
	}

	@RequestMapping(path = { "/soi/awareness", "/soi/awareness/" }, method = RequestMethod.GET)
	public List<AwarenessData> soiAwareness() {
		List<AwarenessData> awarenessDataList = soiAwareness.getPositionsOfVehicles(12);
		for (AwarenessData awarenessData : awarenessDataList) {
			logger.info("name:" + awarenessData.getName());
			logger.info("positions: " + awarenessData.getPositions().size());
		}
		return awarenessDataList;
	}

	@PreAuthorize("hasRole('OPERATOR')")	 
	@PostMapping(path = {"/soi", "/soi/"}, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updatePlan(@RequestBody NewPlanBody body) 
			throws SendSoiCommandException, AssetNotFoundException {
		Optional<Asset> optAsset = repo.findById(body.getVehicleName());
		if (optAsset.isPresent()) {
			Asset asset = optAsset.get();
			Plan plan = body.getPlan();
			SoiCommand cmd = new SoiCommand();
            cmd.setCommand(COMMAND.EXEC);
            cmd.setType(TYPE.REQUEST);
            cmd.setPlan(plan.asImc());
            try {
            	soiInteraction.sendCommand(cmd,  asset);
            	asset.setPlan(plan);
    			repo.save(asset);
			} catch (Exception e) {
				e.printStackTrace();
				System.out.println(e.getMessage());
				throw new SendSoiCommandException(e.getMessage());
			}
            return new ResponseEntity<>(
            		new HTTPResponse("success", "Plan for " + asset.getName() + " was updated."),
            		HttpStatus.OK);
		}
		throw new AssetNotFoundException(body.getVehicleName());
	}



}
