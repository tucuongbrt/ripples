package pt.lsts.ripples.jobs;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.backup.AISShipRecord;
import pt.lsts.ripples.domain.backup.AssetPositionRecord;
import pt.lsts.ripples.domain.backup.UserLocationRecord;
import pt.lsts.ripples.repo.backup.BackupRepository;
import pt.lsts.ripples.repo.main.AISRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.UserLocationRepository;

@Component
public class BackupSaver {

    private Logger logger = LoggerFactory.getLogger(BackupSaver.class);

    @Autowired
    private BackupRepository backupRepo;

    @Autowired
    private AISRepository aisRepo;

    @Autowired
    private PositionsRepository assetsRepo;

    @Autowired
    private UserLocationRepository userLocationsRepo;

    @Scheduled(cron = "0 0 * ? * *")
    public void backupData() {
        logger.info("Data backup initialized...");

        Instant anHourAgo = Instant.now().minus(Duration.ofHours(1));
        Date anHourAgoDate = Date.from(anHourAgo);

        backupAisPositions(anHourAgoDate);
        backupAssetPositions(anHourAgoDate);
        backupUserLocations(anHourAgoDate);

        logger.info("Data backup terminated!");
    }

    public void backupAisPositions(Date fromDate) {
        ArrayList<AISShipRecord> aisList = new ArrayList<>();
        aisRepo.findByTimestampAfter(fromDate).forEach(s -> {
            logger.info("AIS found: ", s.getName());
            backupRepo.save(new AISShipRecord(s));
        });
        logger.info("Saved " + aisList.size() + " AISShip");
    }

    public void backupAssetPositions(Date fromDate) {
        ArrayList<AssetPositionRecord> assetsList = new ArrayList<>();
        assetsRepo.findByTimestampAfter(fromDate).forEach(a -> {
            backupRepo.save(new AssetPositionRecord(a));
        });
        logger.info("Saved " + assetsList.size() + " AssetPosition");
    }

    public void backupUserLocations(Date fromDate) {
        ArrayList<UserLocationRecord> userLocationsList = new ArrayList<>();
        logger.info(userLocationsRepo.findAll().toString());
        userLocationsRepo.findByTimestampAfter(fromDate).forEach(u -> {
            backupRepo.save(new UserLocationRecord(u));
        });
        logger.info("Saved " + userLocationsList.size() + " UserLocation");
    }
}
