package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.services.MessageProcessor;

@RestController
public class PositionsController {

    @Autowired
    PositionsRepository repo;

    @Autowired
    MessageProcessor processor;

    @GetMapping(path = { "/positions", "/positions/" }, produces = "application/json")
    public List<AssetPosition> listPositions(@RequestParam(value = "_", defaultValue = "") String since) {

        final Date start = since.isEmpty() ? new Date(System.currentTimeMillis() - 1000 * 3600 * 24)
                : new Date(Long.valueOf(since));

        return repo.assetNames().stream()
                .flatMap(asset -> repo.findTop100ByNameOrderByTimestampDesc(asset).stream())
                .filter(asset -> asset.getTimestamp().after(start))
                .collect(Collectors.toList());
    }

    @GetMapping(path = { "/positions/{assetName}/{timestamp}",
            "/positions/{assetName}/{timestamp}/" }, produces = "application/json")
    public List<AssetPosition> listPositionsBySystem(@PathVariable("assetName") String assetName,
            @PathVariable("timestamp") String timestamp) {

        final Date date = new Date(Long.valueOf(timestamp) * 1000);

        List<AssetPosition> positionsByName = repo.assetNames().stream()
                .flatMap(asset -> repo.findByNameOrderByTimestamp(assetName).stream())
                .filter(asset -> asset.getTimestamp().after(date))
                .distinct()
                .collect(Collectors.toList());

        // ignore duplicated values
        List<AssetPosition> positionsByNameParsed = new ArrayList<AssetPosition>();
        for (AssetPosition p : positionsByName) {
            if (!positionsByNameParsed.contains(p)) {
                positionsByNameParsed.add(p);
            }
        }
        
        // ignore positions with the same coordinates and timestamp
        List<Long> validPositions = new ArrayList<Long>();
        for (AssetPosition p : positionsByNameParsed) {
            boolean isPositionValid = true;
            for (AssetPosition p2 : positionsByNameParsed) {
                if (Double.compare(p.getLat(), p2.getLat()) == 0 && Double.compare(p.getLon(), p2.getLon()) == 0
                        && p.getTimestamp().getTime() == p2.getTimestamp().getTime()) {
                    if (isPositionValid) {
                        isPositionValid = false;
                        if (!validPositions.contains(p2.getId())) {
                            validPositions.add(p2.getId());
                        }
                    }
                }
            }
        }

        List<AssetPosition> positionsByNameParsedFinal = new ArrayList<AssetPosition>();
        for (Long l : validPositions) {
            positionsByNameParsed.forEach(p -> {
                if (p.getId() == l) {
                    positionsByNameParsedFinal.add(p);
                }
            });
        }

        return positionsByNameParsedFinal;
    }

    @GetMapping(path = { "/positions/last", "/positions/last" }, produces = "application/json")
    private List<AssetPosition> getLastPositions(@RequestParam(value = "_", defaultValue = "") String since) {

        final Date start = since.isEmpty() ? new Date(System.currentTimeMillis() - 1000 * 3600 * 24)
                : new Date(Long.valueOf(since));

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

    @PostMapping(path = { "/positions", "/positions/" }, consumes = "application/json", produces = "application/json")
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
            this.coordinates = new double[] { pos.getLat(), pos.getLon() };
        }
    }
}
