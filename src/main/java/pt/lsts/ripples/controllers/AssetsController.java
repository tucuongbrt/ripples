package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetInfo;
import pt.lsts.ripples.domain.assets.AssetParams;
import pt.lsts.ripples.domain.shared.APIKey;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.domain.shared.Settings;
import pt.lsts.ripples.repo.main.ApiKeyRepository;
import pt.lsts.ripples.repo.main.AssetsParamsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.SettingsRepository;
import pt.lsts.ripples.services.AssetInfoService;
import pt.lsts.ripples.util.HTTPResponse;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedList;
import java.util.List;
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
    SettingsRepository settingsRepo;

    @Autowired
    WebSocketsController wsController;

    @Autowired
    ApiKeyRepository repoApiKey;

    @Value("${apikeys.secret}")
    String appSecret;

    @PostMapping(path = { "/asset/{id}" }, consumes = "application/json", produces = "application/json")
    public Asset getAsset(@PathVariable String id, @RequestBody Asset asset) {
        Optional<Asset> assetExists = repo.findById(id);

        Asset existing = repo.findById(id).orElse(new Asset(id));

        // check system current domain
        List<String> domain = new ArrayList<>();
        List<Settings> listSettings = settingsRepo.findByDomainName("Ripples");
        if (!listSettings.isEmpty()) {
            List<String[]> params = listSettings.get(0).getParams();
            for (String[] param : params) {
                if (param[0].equals("Current domain")) {
                    if (!param[1].equals("\"\"")) {
                        if (param[1].contains(",")) {
                            String[] parts = param[1].split(",");
                            for (String p : parts) {
                                domain.add(p);
                            }
                        } else {
                            domain.add(param[1]);
                        }

                    }
                }
            }
        }

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
            System.out.println("API key to update assets: " + token);
            
            ArrayList<APIKey> apiKeyList = new ArrayList<>();
            repoApiKey.findAll().forEach(apiKeyList::add);
            for (int i = 0; i < apiKeyList.size(); i++) {
                byte[] salt_db = apiKeyList.get(i).getSalt();
                byte[] token_db = apiKeyList.get(i).getToken();
                String token_db_aux = Base64.getEncoder().encodeToString(token_db);

                try {
                    byte[] token_aux = generateToken(salt_db, appSecret);
                    String token_aux_string = Base64.getEncoder().encodeToString(token_aux);

                    if (token_aux_string.equals(token) && token_db_aux.equals(token)) {
                        // Valid token, insert assets
                        for (int n = 0; n < assets.size(); n++) {
                            Optional<Asset> optAsset = repo.findById(assets.get(n).getName());
                            if (!optAsset.isPresent()) {
                                Asset newAsset = new Asset(assets.get(n).getName());
                                newAsset = assets.get(n);
                                newAsset.setDomain(apiKeyList.get(i).getDomain());
                                repo.save(newAsset);
                                wsController.sendAssetUpdateFromServerToClients(newAsset);
                            } else {
                                Asset oldAsset = optAsset.get();
                                oldAsset.setLastState(assets.get(n).getLastState());
                                if (oldAsset.getPlan().getType().equals("dune")) {
                                    oldAsset.setPlan(assets.get(n).getPlan());
                                }
                                repo.save(oldAsset);
                                wsController.sendAssetUpdateFromServerToClients(oldAsset);
                            }
                        }

                    } else {
                        return new ResponseEntity<>(new HTTPResponse("Error", "Invalid token to update assets."),
                                HttpStatus.OK);
                    }
                } catch (NoSuchAlgorithmException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }

            }

        } else {
            // check system current domain
            List<String> domain = new ArrayList<>();
            List<Settings> listSettings = settingsRepo.findByDomainName("Ripples");
            if (!listSettings.isEmpty()) {
                List<String[]> params = listSettings.get(0).getParams();
                for (String[] param : params) {
                    if (param[0].equals("Current domain")) {
                        if (!param[1].equals("\"\"")) {
                            if (param[1].contains(",")) {
                                String[] parts = param[1].split(",");
                                for (String p : parts) {
                                    domain.add(p);
                                }
                            } else {
                                domain.add(param[1]);
                            }

                        }
                    }
                }
            }
    
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
                    if (oldAsset.getPlan().getType().equals("dune")) {
                        oldAsset.setPlan(asset.getPlan());
                    }
                    repo.save(oldAsset);
                    wsController.sendAssetUpdateFromServerToClients(oldAsset);
                }
            });
        }

        return new ResponseEntity<>(new HTTPResponse("success", assets.size() + " assets were updated."),
                HttpStatus.OK);
    }

    @RequestMapping(path = { "/asset", "/assets", "/assets/", "/asset/" }, method = RequestMethod.GET)
    public List<Asset> listAssets() {
        ArrayList<Asset> assets = new ArrayList<>();
        repo.findAll().forEach(assets::add);
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

    public static byte[] generateToken(byte[] salt, String secret) throws NoSuchAlgorithmException {
        MessageDigest md5Digest = MessageDigest.getInstance("SHA-256");
        md5Digest.update(salt);
        md5Digest.update(secret.getBytes());

        byte[] tokenValue = md5Digest.digest();
        return tokenValue;
    }

}
