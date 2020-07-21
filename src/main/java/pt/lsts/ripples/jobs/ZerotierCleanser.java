package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.services.ZerotierService;

@Component
public class ZerotierCleanser {

    @Autowired
    ZerotierService ztService;

    @Scheduled(cron = "0 0 0 * * ?") // every day
    public void clearTemporaryNodes() {
        ztService.clearNodes();
    }
}