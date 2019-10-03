package pt.lsts.ripples.jobs;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.shared.AISShip;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.domain.shared.UserLocation;
import pt.lsts.ripples.repo.backup.AISBackupRepository;
import pt.lsts.ripples.repo.backup.AssetPositionBackupRepository;
import pt.lsts.ripples.repo.backup.PlanBackupRepository;
import pt.lsts.ripples.repo.backup.UserLocationBackupRepository;
import pt.lsts.ripples.repo.main.AISRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.UserLocationRepository;

@Component
public class BackupSaver {

    private Logger logger = LoggerFactory.getLogger(BackupSaver.class);

    @Autowired
    private AISRepository aisRepo;

    @Autowired
    private PositionsRepository positionsRepo;

    @Autowired
    private UserLocationRepository userLocationsRepo;

    @Autowired
    private AssetsRepository assetsRepo;

    @Autowired
    private AISBackupRepository aisBackupRepo;

    @Autowired
    private AssetPositionBackupRepository assetPosBackupRepo;

    @Autowired
    private PlanBackupRepository planBackupRepo;

    @Autowired
    private UserLocationBackupRepository userLocationBackupRepo;

    @Scheduled(cron = "0 0 * ? * *") // every hour
    public void backupData() {
        logger.info("Data backup initialized...");

        Instant anHourAgo = Instant.now().minus(Duration.ofHours(1));
        Date anHourAgoDate = Date.from(anHourAgo);

        backupAisPositions(anHourAgoDate);
        backupAssetPositions(anHourAgoDate);
        backupUserLocations(anHourAgoDate);
        backupPlans(anHourAgoDate);

        logger.info("Data backup terminated!");
    }

    public void backupAisPositions(Date fromDate) {
        List<AISShip> aisList = aisRepo.findByTimestampAfter(fromDate);
        aisList.forEach(ship -> {
            aisBackupRepo.save(ship);
        });
        logger.info("Saved " + aisList.size() + " AISShip");
    }

    public void backupAssetPositions(Date fromDate) {
        List<AssetPosition> assetsList = positionsRepo.findByTimestampAfter(fromDate);
        assetsList.forEach(pos -> {
            assetPosBackupRepo.save(pos);
        });
        logger.info("Saved " + assetsList.size() + " AssetPosition");
    }

    public void backupUserLocations(Date fromDate) {
        List<UserLocation> userLocationsList = userLocationsRepo.findByTimestampAfter(fromDate);
        userLocationsList.forEach(location -> {
            userLocationBackupRepo.save(location);
        });
        logger.info("Saved " + userLocationsList.size() + " UserLocation");
    }

    public void backupPlans(Date fromDate) {
        List<Asset> assetsList = assetsRepo.findAll().stream().filter(assetFromDate(fromDate))
                .collect(Collectors.<Asset>toList());
        assetsList.forEach(asset -> {
            planBackupRepo.save(asset.getPlan());
        });
        logger.info("Saved " + assetsList.size() + " Plan");
    }

    private Predicate<Asset> assetFromDate(Date fromDate) {
        return a -> (a.getLastState().getTimestamp()  > (fromDate.getTime() / 1000));
    }
}
