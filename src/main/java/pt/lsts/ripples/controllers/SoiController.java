package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiCommand.COMMAND;
import pt.lsts.imc.SoiCommand.TYPE;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.Plan;
import pt.lsts.ripples.domain.soi.*;
import pt.lsts.ripples.exceptions.AssetNotFoundException;
import pt.lsts.ripples.exceptions.SendSoiCommandException;
import pt.lsts.ripples.iridium.SoiInteraction;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.repo.UnassignedPlansRepository;
import pt.lsts.ripples.repo.VertProfilesRepo;
import pt.lsts.ripples.services.AISHubFetcher;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.services.SoiAwareness;
import pt.lsts.ripples.util.HTTPResponse;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

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

	@Autowired
	UnassignedPlansRepository unassignedPlansRepo;

	private static Logger logger = LoggerFactory.getLogger(SoiController.class);

	@RequestMapping(path = { "/soi/", "/soi" }, method = RequestMethod.GET)
	public List<Asset> listAssets() {
		ArrayList<Asset> assets = new ArrayList<>();
		repo.findAll().forEach(assets::add);
		return assets;
	}

	@RequestMapping(path = { "/soi/all/profiles", "/soi/all/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listAllProfiles() {
		ArrayList<VerticalProfileData> profs = new ArrayList<>();
		vertProfiles.findAll().forEach(profs::add);
		return profs;
	}

	@RequestMapping(path = { "/soi/profiles", "/soi/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listProfiles() {
		Instant aDayAgo = Instant.now().minus(Duration.ofHours(24));
		Date aDayAgoDate = Date.from(aDayAgo);
		ArrayList<VerticalProfileData> profs = new ArrayList<>();
		vertProfiles.findByTimestampAfter(aDayAgoDate).forEach(profs::add);
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
	@PostMapping(path = { "/soi", "/soi/" }, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updatePlan(@RequestBody NewPlanBody message)
			throws SendSoiCommandException, AssetNotFoundException {
		Optional<Asset> optAsset = repo.findById(message.getAssignedTo());
		if (optAsset.isPresent()) {
			Asset asset = optAsset.get();
			Plan plan = message.buildPlan();
			SoiCommand cmd = new SoiCommand();
			cmd.setCommand(COMMAND.EXEC);
			cmd.setType(TYPE.REQUEST);
			cmd.setPlan(plan.asImc());
			try {
				soiInteraction.sendCommand(cmd, asset);
				asset.setPlan(plan);
				repo.save(asset);
			} catch (Exception e) {
				logger.warn(e.getMessage());
				throw new SendSoiCommandException(e.getMessage());
			}
			return new ResponseEntity<>(new HTTPResponse("success", "Plan for " + asset.getName() + " was updated."),
					HttpStatus.OK);
		}
		throw new AssetNotFoundException(message.getAssignedTo());
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@PostMapping(path = { "/soi/unassigned/plans",
			"/soi/unassigned/plans/" }, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> addUnassignedPlan(@RequestBody NewPlanBody message)
			throws SendSoiCommandException {
		try {
			Plan plan = message.buildPlan();
			logger.info("new plan id: " + plan.getId());
			logger.info("new plan waypoints: " + plan.getWaypoints().size());
			Optional<Plan> p = unassignedPlansRepo.findById(plan.getId());
			if (p.isPresent()) {
				unassignedPlansRepo.delete(p.get());
			}
			unassignedPlansRepo.save(plan);
			return new ResponseEntity<>(new HTTPResponse("success", "Plan added"), HttpStatus.OK);
		} catch (Exception e) {
			logger.warn(e.getMessage());
			throw new SendSoiCommandException(e.getMessage());
		}
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@RequestMapping(path = { "/soi/unassigned/plans", "/soi/unassigned/plans/" }, method = RequestMethod.GET)
	public List<Plan> getUnassignedPlans() {
		ArrayList<Plan> plans = new ArrayList<>();
		unassignedPlansRepo.findAll().forEach(plans::add);
		return plans;
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@RequestMapping(path = { "/soi/unassigned/plans", "/soi/unassigned/plans/" }, method = RequestMethod.DELETE)
	public ResponseEntity<HTTPResponse> deleteUnassignedPlan(@RequestBody EntityWithId body) {
		
		Optional<Plan> planOptional = unassignedPlansRepo.findById(body.getId());
		if (planOptional.isPresent()) {
			logger.info("Deleting Plan with id: " + body.getId());
			unassignedPlansRepo.deleteById(body.getId());
			return new ResponseEntity<>(new HTTPResponse("success", "Plan deleted"), HttpStatus.OK);
		} else {
			logger.info("Plan with id: " + body.getId() + " not found");
			return new ResponseEntity<>(new HTTPResponse("not found", "Plan not found"), HttpStatus.NOT_FOUND);
		}
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@RequestMapping(path = { "/soi/unassigned/plans/id", "/soi/unassigned/plans/id/" }, method = RequestMethod.PATCH)
	public ResponseEntity<HTTPResponse> updatePlanId(@RequestBody UpdateId body) {
		
		Optional<Plan> planOptional = unassignedPlansRepo.findById(body.getPreviousId());
		if (planOptional.isPresent()) {
			Plan plan = planOptional.get();
			plan.setId(body.getNewId());
			unassignedPlansRepo.save(plan);
			return new ResponseEntity<>(new HTTPResponse("success", "Plan id updated"), HttpStatus.OK);
		} else {
			logger.info("Plan with id: " + body.getPreviousId() + " not found");
			return new ResponseEntity<>(new HTTPResponse("not found", "Plan not found"), HttpStatus.NOT_FOUND);
		}
	}

}
