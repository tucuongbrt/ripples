package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetInfo;
import pt.lsts.ripples.domain.assets.AssetParams;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.repo.main.AssetsParamsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.services.AssetInfoService;
import pt.lsts.ripples.util.HTTPResponse;

import java.util.ArrayList;
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

    @PostMapping(path = { "/asset/{id}" }, consumes = "application/json", produces = "application/json")
    public Asset getAsset(@PathVariable String id, @RequestBody Asset asset) {
        Asset existing = repo.findById(id).orElse(new Asset(id));

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

        repo.save(existing);
        return existing;
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
    @PostMapping("/asset/changeDomain/")
    public ResponseEntity<HTTPResponse> updateAssetDomain(@RequestBody Asset payload) {
        Optional<Asset> asset = repo.findById(payload.getName());
        if (asset.isPresent()) {
            Asset newAssetInfo = asset.get();
            newAssetInfo.setDomain(payload.getDomain());
            repo.save(newAssetInfo);

            return new ResponseEntity<>(new HTTPResponse("Success", "Updated asset domain"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update asset domain"), HttpStatus.NOT_FOUND);
    }
}
