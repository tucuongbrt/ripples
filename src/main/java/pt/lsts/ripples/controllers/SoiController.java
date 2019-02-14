package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
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
import pt.lsts.ripples.domain.soi.NewPlanBody;
import pt.lsts.ripples.domain.soi.VehicleRiskAnalysis;
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.iridium.SoiInteraction;
import pt.lsts.ripples.jobs.AISHubFetcher;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.repo.VertProfilesRepo;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.util.HTTPResponse;

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
	public ConcurrentHashMap<String, VehicleRiskAnalysis> riskAnalysis() {
		aisUpdater.fetchAISHub();
		ConcurrentHashMap<String, VehicleRiskAnalysis> vehiclesRisk = collisionService.updateCollisions();
		return vehiclesRisk;
	}
		 
	@PostMapping(path = {"/soi", "/soi/"}, consumes = "application/json", produces = "application/json")
	@ResponseBody
	public HTTPResponse updatePlan(@RequestBody NewPlanBody body) {
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
				return new HTTPResponse("error", e.getMessage());
			}
			return new HTTPResponse("success", "Plan for " + asset.getName() + " was updated.");
		}
		return new HTTPResponse("error", "Asset not found");
	}


}
