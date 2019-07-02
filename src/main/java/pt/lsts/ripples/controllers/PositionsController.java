package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.repo.PositionsRepository;
import pt.lsts.ripples.services.MessageProcessor;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class PositionsController {

    @Autowired
    PositionsRepository repo;

    @Autowired
    MessageProcessor processor;

    @GetMapping(path = {"/positions", "/positions/"}, produces = "application/json")
    public List<AssetPosition> listPositions(@RequestParam(value = "_", defaultValue = "") String since) {

        final Date start = since.isEmpty() ?
                new Date(System.currentTimeMillis() - 1000 * 3600 * 24) :
                new Date(Long.valueOf(since));

        return repo.assetNames().stream()
                .flatMap(asset -> repo.findTop100ByNameOrderByTimestampDesc(asset).stream())
                .filter(asset -> asset.getTimestamp().after(start))
                .collect(Collectors.toList());
    }

    @GetMapping(path = {"/positions/last", "/positions/last"}, produces = "application/json")
    private List<AssetPosition> getLastPositions(@RequestParam(value = "_", defaultValue = "") String since) {

        final Date start = since.isEmpty() ?
                new Date(System.currentTimeMillis() - 1000 * 3600 * 24) :
                new Date(Long.valueOf(since));

        return repo.assetNames().stream()
                .flatMap(asset -> repo.findTopByNameOrderByTimestampDesc(asset).stream())
                .filter(asset -> asset.getTimestamp().after(start))
                .collect(Collectors.toList());
    }

    @GetMapping(path = "/api/v1/systems", produces = "application/json")
    public List<SystemPosition> listAllSystems() {
    	
    	return getLastPositions("0").stream()
                .map(p -> new SystemPosition(p))
                .collect(Collectors.toList());                
    }

    @GetMapping(path = "/api/v1/systems/active", produces = "application/json")
    public List<SystemPosition> listActiveSystems() {
    	
        return getLastPositions("").stream()
                .map(p -> new SystemPosition(p))
                .collect(Collectors.toList());
    }


    @PostMapping(path = {"/positions", "/positions/"}, consumes = "application/json", produces = "application/json")
    public AssetPosition setPosition(@RequestBody AssetPosition pos) {
        processor.setAssetPosition(pos);
        return pos;
    }
    
    static class SystemPosition {
        final int imcid;
        final String name;
        final Date updated_at;
        final Date created_at;
        final double[] coordinates;

        public int getImcid() {
            return imcid;
        }

        public String getName() {
            return name;
        }

        public Date getUpdated_at() {
            return updated_at;
        }

        public Date getCreated_at() {
            return created_at;
        }

        public double[] getCoordinates() {
            return coordinates;
        }

        public SystemPosition(AssetPosition pos) {
            this.imcid = pos.getImcId();
            this.name = pos.getName();
            this.updated_at = pos.getTimestamp();
            this.created_at = pos.getTimestamp();
            this.coordinates = new double[]{pos.getLat(), pos.getLon()};
        }
    }
}
