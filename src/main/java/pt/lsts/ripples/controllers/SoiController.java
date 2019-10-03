package pt.lsts.ripples.controllers;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiCommand.COMMAND;
import pt.lsts.imc.SoiCommand.TYPE;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetErrors;
import pt.lsts.ripples.domain.shared.Plan;
import pt.lsts.ripples.domain.soi.AwarenessData;
import pt.lsts.ripples.domain.soi.EntityWithId;
import pt.lsts.ripples.domain.soi.NewPlanBody;
import pt.lsts.ripples.domain.soi.PotentialCollision;
import pt.lsts.ripples.domain.soi.UpdateId;
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.exceptions.AssetNotFoundException;
import pt.lsts.ripples.exceptions.SendSoiCommandException;
import pt.lsts.ripples.iridium.SoiInteraction;
import pt.lsts.ripples.repo.main.AssetsErrorsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.IncomingMessagesRepository;
import pt.lsts.ripples.repo.main.UnassignedPlansRepository;
import pt.lsts.ripples.repo.main.VertProfilesRepo;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.services.SoiAwareness;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class SoiController {

	@Autowired
	AssetsRepository assetsRepo;

	@Autowired
	CollisionForecastService collisionService;

	@Autowired
	VertProfilesRepo vertProfiles;

	@Autowired
	SoiInteraction soiInteraction;

	@Autowired
	SoiAwareness soiAwareness;

	@Autowired
	UnassignedPlansRepository unassignedPlansRepo;

	@Autowired
	IncomingMessagesRepository messagesRepository;

	@Autowired
	AssetsErrorsRepository assetsErrorsRepository;

	@Autowired
	WebSocketsController wsController;

	private static Logger logger = LoggerFactory.getLogger(SoiController.class);

	@RequestMapping(path = { "/soi/", "/soi" }, method = RequestMethod.GET)
	public List<Asset> listAssets() {
		ArrayList<Asset> assets = new ArrayList<>();
		assetsRepo.findAll().forEach(assets::add);
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
		return collisionService.getLastCollisions();
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

	/**
	 * To be used by neptus to update assets in real time
	 * 
	 * @param asset
	 * @return
	 */
	@PostMapping(path = { "/soi/assets", "/soi/assets/" }, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updateAssets(@RequestBody ArrayList<Asset> assets) {
		assets.forEach(asset -> {
			Optional<Asset> optAsset = assetsRepo.findById(asset.getName());
			// logger.info("Received update for asset " + asset.getName() + " in " +
			// asset.getLastState().getLatitude() + ";" +
			// asset.getLastState().getLongitude());
			if (!optAsset.isPresent()) {
				assetsRepo.save(asset);
				wsController.sendAssetUpdateFromServerToClients(asset);
			} else {
				Asset oldAsset = optAsset.get();
				oldAsset.setLastState(asset.getLastState());
				if (oldAsset.getPlan().getType().equals("dune")) {
					oldAsset.setPlan(asset.getPlan());
				}
				assetsRepo.save(oldAsset);
				wsController.sendAssetUpdateFromServerToClients(oldAsset);
			}

		});
		return new ResponseEntity<>(new HTTPResponse("success", assets.size() + " assets were updated."),
				HttpStatus.OK);
	}

	/**
	 * Use to assign and send(via rockblock) a new plan to a vehicle
	 */
	@PreAuthorize("hasRole('OPERATOR')")
	@PostMapping(path = { "/soi/plan", "/soi/plan/" }, consumes = "application/json", produces = "application/json")
	public ResponseEntity<HTTPResponse> updatePlan(@RequestBody NewPlanBody message)
			throws SendSoiCommandException, AssetNotFoundException {
		Optional<Asset> optAsset = assetsRepo.findById(message.getAssignedTo());
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
				assetsRepo.save(asset);
			} catch (Exception e) {
				logger.warn(e.getMessage());
				throw new SendSoiCommandException(e.getMessage());
			}
			return new ResponseEntity<>(new HTTPResponse("success", "Plan for " + asset.getName() + " was updated."),
					HttpStatus.OK);
		}
		throw new AssetNotFoundException(message.getAssignedTo());
	}

	/**
	 * Use to add a plan that is not assigned to any vehicle. This can be used by
	 * scientists to share plans that operators can then assign.
	 * 
	 * @param message
	 * @return
	 * @throws SendSoiCommandException
	 */
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

	@RequestMapping(path = { "/soi/incoming/{name}" }, method = RequestMethod.GET, produces = "text/plain")
	@ResponseBody
	public String getIncomingMessagesForAsset(@PathVariable("name") String assetName,
			@RequestParam(value = "since", required = false) Long sinceMs) {
		if (sinceMs == null)
			sinceMs = 0L;
		ArrayList<String> messages = new ArrayList<>();
		messagesRepository.findAllSinceDateForAsset(sinceMs, assetName).forEach(m -> {
			messages.add(m.getMessage());
		});
		logger.info("Found " + messages.size() + " for asset " + assetName);
		return String.join("\n", messages);
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@RequestMapping(path = { "/soi/assets/{imcId}/settings",
			"/soi/assets/{imcId}/settings" }, method = RequestMethod.GET)
	public ResponseEntity<HTTPResponse> fetchSoiSettings(@PathVariable int imcId)
			throws SendSoiCommandException, AssetNotFoundException {
		Asset asset = assetsRepo.findByImcid(imcId);
		if (asset != null) {
			SoiCommand cmd = new SoiCommand();
			cmd.setCommand(COMMAND.GET_PARAMS);
			cmd.setType(TYPE.REQUEST);
			try {
				soiInteraction.sendCommand(cmd, asset);
			} catch (Exception e) {
				logger.warn(e.getMessage());
				throw new SendSoiCommandException(e.getMessage());
			}
			return new ResponseEntity<>(new HTTPResponse("Success", "Settings for " + asset.getName() + " requested."),
					HttpStatus.OK);
		}
		throw new AssetNotFoundException("Asset of imcId " + imcId + " not found");
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
	@RequestMapping(path = { "/soi/assets/{imcId}/settings",
			"/soi/assets/{imcId}/settings" }, method = RequestMethod.POST)
	public ResponseEntity<HTTPResponse> updateSoiSettings(@PathVariable int imcId,
			@RequestBody LinkedHashMap<String,String> settings) throws SendSoiCommandException, AssetNotFoundException {
		Asset asset = assetsRepo.findByImcid(imcId);
		if (asset != null) {
			SoiCommand cmd = new SoiCommand();
			cmd.setCommand(COMMAND.SET_PARAMS);
			cmd.setType(TYPE.REQUEST);
			cmd.setSettings(settings);
			try {
				soiInteraction.sendCommand(cmd, asset);
			} catch (Exception e) {
				logger.warn(e.getMessage());
				throw new SendSoiCommandException(e.getMessage());
			}
			return new ResponseEntity<>(new HTTPResponse("Success", "Settings for " + asset.getName() + " sent."),
					HttpStatus.OK);
		}
		throw new AssetNotFoundException("Asset of imcId " + imcId + " not found");
	}

	@RequestMapping(path = { "/soi/errors/{name}" }, method = RequestMethod.GET)
	public AssetErrors getAssetErrors(@PathVariable("name") String assetName) {
		Optional<AssetErrors> opt = assetsErrorsRepository.findByName(assetName);
		if (opt.isPresent()) {
			return opt.get();
		}
		return new AssetErrors(assetName);
	}

	@RequestMapping(path = { "/soi/errors", "/soi/errors/" }, method = RequestMethod.GET)
	public List<AssetErrors> getAssetsErrors() {
		List<AssetErrors> errors = new ArrayList<>();
		assetsErrorsRepository.findAll().forEach(errors::add);
		return errors;
	}

	@PreAuthorize("hasRole('OPERATOR')")
	@Transactional
	@RequestMapping(path = { "/soi/errors/{name}" }, method = RequestMethod.DELETE)
	public ResponseEntity<HTTPResponse> deleteAssetErrors(@PathVariable("name") String assetName) {
		logger.info("Delete errors called for asset: " + assetName);
		assetsErrorsRepository.deleteByName(assetName);
		return new ResponseEntity<>(new HTTPResponse("success", "Asset errors cleared"), HttpStatus.OK);
	}

}
