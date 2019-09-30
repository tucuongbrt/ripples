package pt.lsts.ripples.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.domain.assets.Plan;
import pt.lsts.ripples.domain.soi.AwarenessData;
import pt.lsts.ripples.domain.soi.PositionAtTime;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SoiAwareness {

    @Autowired
    PositionsRepository posRepo;

    @Autowired
    AssetsRepository assetsRepo;

    public List<AwarenessData> getPositionsOfVehicles(int rangeHours) {
        List<AwarenessData> positions = new ArrayList<>();
        List<String> vehicleNames = posRepo.assetNames();
        vehicleNames.forEach(vehicle -> {
            AwarenessData data = new AwarenessData(vehicle);
            getPastPositionsOfVehicle(rangeHours, data);
            getFuturePositionsOfVehicle(rangeHours, data);
            positions.add(data);
        });
        return positions;
    }

    private void getPastPositionsOfVehicle(int rangeHours, AwarenessData data) {
        String vehicleName = data.getName();
        Date minDate = Date.from(Instant.now().minus(Duration.ofHours(rangeHours)));
        List<AssetPosition> pastPositions = posRepo.findByName(vehicleName);
        pastPositions.forEach(pos -> {
            if (pos.getTimestamp().after(minDate)) {
                data.addPosition(new PositionAtTime(pos.getLat(), pos.getLon(), pos.getTimestamp().getTime()));
            }
        });
    }

    private void getFuturePositionsOfVehicle(int rangeHours, AwarenessData data) {
        String vehicleName = data.getName();
        Date now = Date.from(Instant.now());
        Date maxDate = Date.from(Instant.now().plus(Duration.ofHours(rangeHours)));
        Optional<Asset> optAsset = assetsRepo.findById(vehicleName);
        optAsset.ifPresent(asset -> {
            Plan assetPlan = asset.getPlan();
            if (assetPlan != null) {
                List<PositionAtTime> positions = assetPlan.getWaypoints()
                    .stream()
                    .filter(wp ->
                        wp.getArrivalDate().after(now) && wp.getArrivalDate().before(maxDate))
                    .map(wp ->
                        new PositionAtTime(wp.getLatitude(), wp.getLongitude(), wp.getArrivalDate().getTime()))
                    .collect(Collectors.toList());

                data.addPositions(positions);
            }
        });
    }

}
