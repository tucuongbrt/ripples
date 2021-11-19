package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetInfo;
import pt.lsts.ripples.domain.assets.AssetParams;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.domain.shared.Plan;
import pt.lsts.ripples.domain.shared.Waypoint;
import pt.lsts.ripples.repo.main.ApiKeyRepository;
import pt.lsts.ripples.repo.main.AssetsParamsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.UnassignedPlansRepository;
import pt.lsts.ripples.services.ApiKeyService;
import pt.lsts.ripples.services.AssetInfoService;
import pt.lsts.ripples.services.SettingsService;
import pt.lsts.ripples.util.HTTPResponse;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class AssetsController {

    @Autowired
    AssetsRepository repo;

    @Autowired
    PositionsRepository positions;

    @Autowired
    AssetInfoService assetInfos;

    @Autowired
    AssetsParamsRepository assetParamsRepo;

    @Autowired
    WebSocketsController wsController;

    @Autowired
    ApiKeyRepository repoApiKey;

    @Autowired
    SettingsService settingsService;

    @Autowired
    ApiKeyService apiKeyService;

    @Autowired
    UnassignedPlansRepository unassignedPlansRepo;

    @Value("${apikeys.secret}")
    String appSecret;

    private final Logger logger = LoggerFactory.getLogger(AssetsController.class);

    @PostMapping(path = { "/asset/{id}" }, consumes = "application/json", produces = "application/json")
    public Asset getAsset(@PathVariable String id, @RequestBody Asset asset) {
        Optional<Asset> assetExists = repo.findById(id);

        Asset existing = repo.findById(id).orElse(new Asset(id));

        // check system current domain
        List<String> domain = settingsService.getCurrentDomain();

        if (asset.getPlan() != null && asset.getPlan().getId() != null) {
            existing.setPlan(asset.getPlan());
        }

        if (asset.getLastState() != null) {
            existing.setLastState(asset.getLastState());

            AssetPosition pos = new AssetPosition();
            pos.setLat(asset.getLastState().getLatitude());
            pos.setLon(asset.getLastState().getLongitude());
            pos.setTimestamp(asset.getLastState().getDate());
            pos.setName(id);
            pos.setImcId(asset.getImcid());
            positions.save(pos);
        }

        if (!assetExists.isPresent()) {
            existing.setDomain(domain);
        }

        repo.save(existing);
        return existing;
    }

    @PostMapping(path = { "/assets", "/assets/" }, consumes = "application/json", produces = "application/json")
    public ResponseEntity<HTTPResponse> updateAssets(@RequestBody ArrayList<Asset> assets,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (token != null) {
            if (apiKeyService.isTokenValid(token) && apiKeyService.isTokenWriteable(token)) {
                List<String> domain = apiKeyService.getTokenDomain(token);
                logger.info("Updated assets with API key: " + domain.toString());
                for (int n = 0; n < assets.size(); n++) {
                    Optional<Asset> optAsset = repo.findById(assets.get(n).getName());
                    if (!optAsset.isPresent()) {
                        Asset newAsset = new Asset(assets.get(n).getName());
                        newAsset = assets.get(n);
                        newAsset.setDomain(domain);
                        repo.save(newAsset);
                        wsController.sendAssetUpdateFromServerToClients(newAsset);
                    } else {
                        Asset oldAsset = optAsset.get();
                        oldAsset.setLastState(assets.get(n).getLastState());
                        if (oldAsset.getPlan().getType() != null && oldAsset.getPlan().getType().equals("dune")) {
                            oldAsset.setPlan(assets.get(n).getPlan());
                        }
                        repo.save(oldAsset);
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
                Optional<Asset> optAsset = repo.findById(asset.getName());
                if (!optAsset.isPresent()) {
                    Asset newAsset = new Asset(asset.getName());
                    newAsset = asset;
                    newAsset.setDomain(domain);
                    repo.save(asset);
                    wsController.sendAssetUpdateFromServerToClients(asset);
                } else {
                    Asset oldAsset = optAsset.get();
                    oldAsset.setLastState(asset.getLastState());
                    if (oldAsset.getPlan().getType() != null && oldAsset.getPlan().getType().equals("dune")) {
                        oldAsset.setPlan(asset.getPlan());
                    }
                    repo.save(oldAsset);
                    wsController.sendAssetUpdateFromServerToClients(oldAsset);
                }
            });

            return new ResponseEntity<>(new HTTPResponse("success", assets.size() + " assets were updated."),
                    HttpStatus.OK);
        }
    }

    @RequestMapping(path = { "/asset", "/assets", "/assets/", "/asset/" }, method = RequestMethod.GET)
    public List<Asset> listAssets(@RequestHeader(value = "Authorization", required = false) String token) {
        ArrayList<Asset> assets = new ArrayList<>();
        ArrayList<Asset> assets_aux = repo.findAll();

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

    @RequestMapping(path = { "/assetInfo" }, method = RequestMethod.GET)
    public List<AssetInfo> listAssetInfo() {
        ArrayList<AssetInfo> assets = new ArrayList<>();
        assetInfos.getInfos().forEach(assets::add);
        return assets;
    }

    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/assets/params" }, method = RequestMethod.GET)
    public List<AssetParams> listAssetParams() {
        ArrayList<AssetParams> assetsParams = new ArrayList<>();
        assetParamsRepo.findAll().forEach(assetsParams::add);
        return assetsParams;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping("/asset/changeDomain/{assetName}")
    public ResponseEntity<HTTPResponse> updateAssetDomain(@PathVariable String assetName,
            @RequestBody String[] domain) {
        List<String> domains = new LinkedList<String>(Arrays.asList(domain));
        Optional<Asset> asset = repo.findById(assetName);
        if (asset.isPresent()) {
            Asset newAssetInfo = asset.get();
            newAssetInfo.setDomain(domains);
            repo.save(newAssetInfo);
            return new ResponseEntity<>(new HTTPResponse("Success", "Updated asset domain"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update asset domain"), HttpStatus.NOT_FOUND);
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @DeleteMapping("/asset/{assetName}")
    public ResponseEntity<HTTPResponse> deleteAsset(@PathVariable String assetName) {
        Optional<Asset> asset = repo.findById(assetName);
        if (asset.isPresent()) {
            Asset assetToDelete = asset.get();
            repo.delete(assetToDelete);
            return new ResponseEntity<>(new HTTPResponse("Success", "Asset deleted"), HttpStatus.OK);      
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot delete asset"), HttpStatus.NOT_FOUND);
    }

    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/asset/laststate/{assetName}" }, method = RequestMethod.GET)
    public AssetState assetLastState(@PathVariable String assetName) {
        Optional<Asset> optAsset = repo.findById(assetName);
        if (optAsset.isPresent()) {
            Asset asset = optAsset.get();
            return asset.getLastState();
        }
        return null;
    }

    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/asset/plan/{planId}" }, method = RequestMethod.GET)
    public Waypoint assetPlanPosition(@PathVariable String planId) {
        // position from unassigned plans
        Optional<Plan> optPlan = unassignedPlansRepo.findById(planId);
        if (optPlan.isPresent()) {
            Plan plan = optPlan.get();
            if(plan.getWaypoints().size() > 0) {
                return plan.getWaypoints().get(0); 
            }
        }
        // position from assets plans
        ArrayList<Asset> assets = repo.findAll();
        for (int i = 0; i < assets.size(); i++) {
            if(assets.get(i).getPlan().getId() == planId) {
                if(assets.get(i).getPlan().getWaypoints().size() > 0) {
                    return assets.get(i).getPlan().getWaypoints().get(0); 
                }
            }
        }
        return null;
    }

    //@PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping("/asset/changeType")
    public ResponseEntity<HTTPResponse> updateAssetType(@RequestBody Map<String, String> payload) {
        Optional<Asset> asset = repo.findById(payload.get("assetName"));
        if(asset.isPresent()){
            Asset newAssetInfo = asset.get();
            newAssetInfo.setType(payload.get("type"));
            repo.save(newAssetInfo);
            logger.info("Updated asset type: " + payload.get("assetName") + " - " + payload.get("type"));
            return new ResponseEntity<>(new HTTPResponse("Success", "Updated asset type"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update asset type"), HttpStatus.NOT_FOUND);
    }

    public static byte[] generateToken(byte[] salt, String secret) throws NoSuchAlgorithmException {
        MessageDigest md5Digest = MessageDigest.getInstance("SHA-256");
        md5Digest.update(salt);
        md5Digest.update(secret.getBytes());

        byte[] tokenValue = md5Digest.digest();
        return tokenValue;
    }

}
