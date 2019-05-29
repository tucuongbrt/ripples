package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.lsts.ripples.domain.soi.PotentialCollision;
import pt.lsts.ripples.services.CollisionForecastService;
import pt.lsts.ripples.services.SMSService;

import java.util.HashSet;

@Component
public class CollisionForecastJob {

    @Autowired
    CollisionForecastService collisionService;

    @Autowired
    SMSService smsService;


    @Scheduled(fixedRate = 900_000)
    public void calculateCollisions() {
        HashSet<PotentialCollision> collisions = collisionService.updateCollisions();
        if (collisions.size() > 0) {
            StringBuilder smsText = new StringBuilder();
            smsText.append("Found " + collisions.size() + " collisions.\n");
            collisions.forEach(c -> smsText.append(c.toString() + "\n"));
            smsService.sendMessage(smsText.toString());
        }
    }

}
