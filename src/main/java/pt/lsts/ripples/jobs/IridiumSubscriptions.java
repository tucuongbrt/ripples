package pt.lsts.ripples.jobs;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.iridium.IridiumSubscription;
import pt.lsts.ripples.iridium.DeviceUpdate;
import pt.lsts.ripples.iridium.Position;
import pt.lsts.ripples.iridium.RockBlockIridiumSender;
import pt.lsts.ripples.repo.AddressesRepository;
import pt.lsts.ripples.repo.PositionsRepository;
import pt.lsts.ripples.repo.SubscriptionsRepo;

@Component
public class IridiumSubscriptions {

	@Autowired
	SubscriptionsRepo repo;
	
	@Autowired
	RockBlockIridiumSender sender;
	
	@Autowired
	PositionsRepository positionsRepo;
	
	@Autowired
    AddressesRepository addressesRepo;
	
	private static Logger logger = LoggerFactory.getLogger(IridiumSubscriptions.class);

	
	@Scheduled(fixedRate = 60_000) // every minute
	public void clearOldSubscribers() {
		List<IridiumSubscription> oldSubscribers = repo.findAllByDeadlineBefore(new Date());
		
		for (IridiumSubscription sub : oldSubscribers) {
			repo.delete(sub);
			logger.warn("Removing expired subscriber: "+sub.getImei());
		}
	}
	
	@Scheduled(fixedRate = 120_000) // every 2 minutes
	public void sendPositions() {
		Iterator<IridiumSubscription> subscribers = repo.findAll().iterator();
		if (!subscribers.hasNext()) {
			logger.info("There are no iridium subscriptions.");
			return;
		}
		
		DeviceUpdate positions = new DeviceUpdate();
		
		List<String> assets = positionsRepo.assetNames();
		for (String asset: assets) {
			List<AssetPosition> assetPositions = positionsRepo.findTopByNameOrderByTimestampDesc(asset);
			AssetPosition latest = null;
			if (!assetPositions.isEmpty())
				latest = assetPositions.get(0);
			
			if (latest == null) {
				logger.warn("Device "+asset+" has no positions.");
				continue;
			}
			if (System.currentTimeMillis() - latest.getTimestamp().getTime() > 121_000) {
				logger.warn(asset+"'s position is too old and won't be transmitted: "+latest.getTimestamp());
				continue;
			}
			Position pos = new Position();
			pos.id = latest.getImcId();
			pos.latRads = Math.toRadians(latest.getLat());
			pos.lonRads = Math.toRadians(latest.getLon());
			pos.timestamp = latest.getTimestamp().getTime() / 1000.0;
			pos.posType = Position.fromImcId(pos.id);
			positions.getPositions().put(latest.getImcId(), pos);
		}
		
		
		if (positions.getPositions().isEmpty()) {
			logger.warn("There are no new positions to send.");
			return;
		}
		
		subscribers.forEachRemaining(sub -> {
		
			SystemAddress address = addressesRepo.findByImei(sub.getImei());
			if (address == null) {
				logger.error("Could not find imc_id for imei "+sub.getImei());
				return;
			}
			
			positions.destination = address.getImcId();
			try {
				sender.sendMessage(positions);
				logger.info("DeviceUpdates sent to subscriber "+address);
			}
			catch (Exception e) {
				logger.error("Not possible to send device updates message to subscriber: "+e.getMessage());
			}
			
		});
		
	}
}
