package pt.lsts.ripples.controllers;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiCommand.COMMAND;
import pt.lsts.imc.SoiCommand.TYPE;
import pt.lsts.imc4j.util.PlanUtilities.Waypoint;
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
import pt.lsts.ripples.repo.main.ApiKeyRepository;
import pt.lsts.ripples.repo.main.AssetsErrorsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.IncomingMessagesRepository;
import pt.lsts.ripples.repo.main.UnassignedPlansRepository;
import pt.lsts.ripples.repo.main.VertProfilesRepo;
import pt.lsts.ripples.services.ApiKeyService;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.services.SettingsService;
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

	@Autowired
	ApiKeyRepository repoApiKey;

	@Autowired
	SettingsService settingsService;

	@Autowired
	ApiKeyService apiKeyService;

	@Value("${apikeys.secret}")
	String appSecret;

	private static Logger logger = LoggerFactory.getLogger(SoiController.class);

	@RequestMapping(path = { "/soi/", "/soi" }, method = RequestMethod.GET)
	public List<Asset> listAssets(@RequestHeader(value = "Authorization", required = false) String token) {
		ArrayList<Asset> assets = new ArrayList<>();
		ArrayList<Asset> assets_aux = assetsRepo.findAll();

		if (token != null && apiKeyService.isTokenValid(token) && apiKeyService.isTokenReadable(token)) {
			List<String> domains = apiKeyService.getTokenDomain(token);
			if (domains != null) {
				for (Asset a : assets_aux) {
					for (String domain : domains) {
						if (a.getDomain().contains(domain) && !assets.contains(a)) {
							assets.add(a);
						}
					}
				}
			}
		}

		// assets without domain
		for (Asset a : assets_aux) {
			if (a.getDomain().isEmpty() && !assets.contains(a)) {
				assets.add(a);
			}
		}

		return assets;
	}

	@RequestMapping(path = { "/soi/{userDomain}/", "/soi/{userDomain}" }, method = RequestMethod.GET)
	public List<Asset> listAssetsByDomain(@PathVariable String[] userDomain) {
		ArrayList<Asset> assetsByDomain = new ArrayList<>();

		// read settings
		String settingsDisplayAssets = settingsService.getAssetsDisplayTime();
		Instant previousThreeMonths = Instant.now().minus(Duration.ofDays(90));
		Date defaultDate = Date.from(previousThreeMonths);
		if (settingsDisplayAssets != null && settingsDisplayAssets.replaceAll("\"", "").length() > 0) {
			try {
				defaultDate = new SimpleDateFormat("dd/MM/yyyy").parse(settingsDisplayAssets);
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

		ArrayList<Asset> assets = assetsRepo.findAll();
		for (Asset a : assets) {
			for (String domain : userDomain) {
				if (a.getDomain().contains(domain) && !assetsByDomain.contains(a)
						&& a.getLastState().getDate().after(defaultDate)) {
					assetsByDomain.add(a);
				}
			}

			// assets without domain
			if (a.getDomain().isEmpty() && !assetsByDomain.contains(a)
					&& a.getLastState().getDate().after(defaultDate)) {
				assetsByDomain.add(a);
			}
		}
		return assetsByDomain;
	}

	@RequestMapping(path = { "/soi/all/profiles", "/soi/all/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listAllProfiles() {
		ArrayList<VerticalProfileData> profs = new ArrayList<>();
		vertProfiles.findAll().forEach(profs::add);
		return profs;
	}

	@RequestMapping(path = { "/soi/profiles", "/soi/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listProfiles() {
		// read settings
		String settingsDisplayProfiles = settingsService.getProfilesDisplayTime();
		long time = 24;
		if (settingsDisplayProfiles != null && settingsDisplayProfiles.replaceAll("\"", "").length() > 0) {
			time = Long.parseLong(settingsDisplayProfiles);
		}
		Instant aDayAgo = Instant.now().minus(Duration.ofHours(time));
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
	public ResponseEntity<HTTPResponse> updateAssets(@RequestBody ArrayList<Asset> assets,
			@RequestHeader(value = "Authorization", required = false) String token) {

		if (token != null) {
			logger.info("API key to update assets: " + token);
			if (apiKeyService.isTokenValid(token) && apiKeyService.isTokenWriteable(token)) {
				for (int n = 0; n < assets.size(); n++) {
					List<String> domain = apiKeyService.getTokenDomain(token);
					Optional<Asset> optAsset = assetsRepo.findById(assets.get(n).getName());
					if (!optAsset.isPresent()) {
						Asset newAsset = new Asset(assets.get(n).getName());
						newAsset = assets.get(n);
						newAsset.setDomain(domain);
						assetsRepo.save(newAsset);
						wsController.sendAssetUpdateFromServerToClients(newAsset);
					} else {
						Asset oldAsset = optAsset.get();
						oldAsset.setLastState(assets.get(n).getLastState());
						if (oldAsset.getPlan().getType() != null && oldAsset.getPlan().getType().equals("dune")) {
							oldAsset.setPlan(assets.get(n).getPlan());
						}
						assetsRepo.save(oldAsset);
						wsController.sendAssetUpdateFromServerToClients(oldAsset);
					}
				}
				return new ResponseEntity<>(new HTTPResponse("success", assets.size() + " assets were updated."),
						HttpStatus.OK);
			} else {
				return new ResponseEntity<>(new HTTPResponse("error", "Invalid token"), HttpStatus.OK);
			}
		} else {
			// check system current domain
			List<String> domain = settingsService.getCurrentDomain();
			assets.forEach(asset -> {
				Optional<Asset> optAsset = assetsRepo.findById(asset.getName());
				if (!optAsset.isPresent()) {
					Asset newAsset = new Asset(asset.getName());
					newAsset = asset;
					newAsset.setDomain(domain);
					assetsRepo.save(asset);
					wsController.sendAssetUpdateFromServerToClients(asset);
				} else {
					Asset oldAsset = optAsset.get();
					oldAsset.setLastState(asset.getLastState());
					if (oldAsset.getPlan().getType() != null && oldAsset.getPlan().getType().equals("dune")) {
						oldAsset.setPlan(asset.getPlan());
					}
					assetsRepo.save(oldAsset);
					wsController.sendAssetUpdateFromServerToClients(oldAsset);
				}
			});

			return new ResponseEntity<>(new HTTPResponse("success", assets.size() + " assets were updated."),
					HttpStatus.OK);
		}
	}

	/**
	 * Use to assign and send(via rockblock) a new plan to a vehicle
	 */
	@PreAuthorize("hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
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
	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
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

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
	@RequestMapping(path = { "/soi/unassigned/plans", "/soi/unassigned/plans/" }, method = RequestMethod.GET)
	public List<Plan> getUnassignedPlans() {
		ArrayList<Plan> plans = new ArrayList<>();
		unassignedPlansRepo.findAll().forEach(plans::add);
		return plans;
	}

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
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

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
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

	// @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
	@RequestMapping(path = { "/soi/plan/{planName}" }, method = RequestMethod.DELETE)
	public ResponseEntity<HTTPResponse> deletePlan(@PathVariable String planName) {
		// set idle all the assigned plans
		ArrayList<Asset> assets = assetsRepo.findAll();
		for (Asset a : assets) {
			if(a.getPlan().getId().equals(planName) && !a.getPlan().getId().equals("idle")) {
				Plan p = new Plan();
				p.setId("idle");
				a.setPlan(p);
				assetsRepo.save(a);
			}
		}

		ArrayList<Plan> plans = (ArrayList<Plan>) unassignedPlansRepo.findAll();
		plans.forEach(p -> {
			if (p.getId().equals(planName) && !p.getId().equals("idle")) {
				unassignedPlansRepo.delete(p);
			}
		});
		return new ResponseEntity<>(new HTTPResponse("success", "Plan deleted"), HttpStatus.OK);
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

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
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

	@PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
	@RequestMapping(path = { "/soi/assets/{imcId}/settings",
			"/soi/assets/{imcId}/settings" }, method = RequestMethod.POST)
	public ResponseEntity<HTTPResponse> updateSoiSettings(@PathVariable int imcId,
			@RequestBody LinkedHashMap<String, String> settings)
			throws SendSoiCommandException, AssetNotFoundException {
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

	@PreAuthorize("hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
	@Transactional
	@RequestMapping(path = { "/soi/errors/{name}" }, method = RequestMethod.DELETE)
	public ResponseEntity<HTTPResponse> deleteAssetErrors(@PathVariable("name") String assetName) {
		logger.info("Delete errors called for asset: " + assetName);
		assetsErrorsRepository.deleteByName(assetName);
		return new ResponseEntity<>(new HTTPResponse("success", "Asset errors cleared"), HttpStatus.OK);
	}

	public static byte[] generateToken(byte[] salt, String secret) throws NoSuchAlgorithmException {
		MessageDigest md5Digest = MessageDigest.getInstance("SHA-256");
		md5Digest.update(salt);
		md5Digest.update(secret.getBytes());

		byte[] tokenValue = md5Digest.digest();
		return tokenValue;
	}

}
