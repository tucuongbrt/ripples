package pt.lsts.ripples.services;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.aismanager.ShipAisSnapshot;
import pt.lsts.aismanager.api.AisContactManager;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.domain.soi.VehicleRiskAnalysis;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.util.Pair;
import pt.lsts.util.WGS84Utilities;

@Service
public class CollisionForecastService {

	@Autowired
	AssetsRepository assetsRepo;
	
	private final int collisionDistance = 100;
	
	private final Logger logger = LoggerFactory.getLogger(CollisionForecastService.class);
	
	private ConcurrentHashMap<String, VehicleRiskAnalysis> state = new ConcurrentHashMap<>();
	
	public ConcurrentHashMap<String, VehicleRiskAnalysis> updateCollisions() {
        long start = System.currentTimeMillis();

        // (vehicle, ship) -> (distance, timestamp)
        final ConcurrentHashMap<Pair<String, String>, Pair<Double, Date>> collisions = new ConcurrentHashMap<>();

        for (long timeOffset = 0; timeOffset < 3_600 * 3_000; timeOffset += 1_000 * collisionDistance/4) {
            final long time = timeOffset;
            HashMap<String, ShipAisSnapshot> ships = AisContactManager.getInstance().getFutureSnapshots(time);

            assetsRepo.findAll().forEach(asset -> {
                Date t = new Date(System.currentTimeMillis() + time);
                AssetState aState = asset.stateAt(t);
                if (aState == null)
                    return;

                ships.values().forEach(ship -> {
                    double distance = WGS84Utilities.distance(aState.getLatitude(), aState.getLongitude(),
                            ship.getLatDegs(), ship.getLonDegs());
                    if (distance < collisionDistance) {
                        collisions.putIfAbsent(
                            new Pair<>(asset.getName(), ship.getLabel()),
                            new Pair<>(distance, t));
                    }
                        
                });
            });
        }

        logger.info("Collisions size: " + collisions.size());

        state.forEachValue(1, s -> {
            s.clearCollisions();
        });
        
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        
        collisions.forEach((systems, info) -> {
            String vehicle = systems.first();
            String ship = systems.second();
            Date when = info.second();

            double distance = info.first();
            
            VehicleRiskAnalysis analysis = state.get(vehicle);
            if (analysis != null) {
                analysis.putCollision(when, ship+" within "+(int)distance+"m @ "+sdf.format(when)+" UTC");
            }
        });
                
        long diff = System.currentTimeMillis() - start;

        logger.info("RiskAnalysis detected " + collisions.size() + " collisions in " + diff + " milliseconds.");
        return state;
    }

}
