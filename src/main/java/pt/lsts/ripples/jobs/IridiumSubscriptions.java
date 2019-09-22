package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.iridium.RockBlockIridiumSender;
import pt.lsts.ripples.repo.SubscriptionsRepo;

@Component
public class IridiumSubscriptions {

	@Autowired
	SubscriptionsRepo repo;
	
	@Autowired
	RockBlockIridiumSender sender;
	
	
	
	
	
}
