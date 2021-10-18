package pt.lsts.ripples.jobs;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.repo.main.AssetsRepository;

@Component
public class AssetsCleanser {

    private Logger logger = LoggerFactory.getLogger(BackupSaver.class);

    @Autowired
    AssetsRepository assetsRepo;

    @Scheduled(cron = "0 0 * ? * *") // every hour
    public void clearAssets() {
        logger.info("Remove assets with invalid positions...");
        assetsRepo.findAll().forEach(asset -> {
            if (Double.compare(asset.getLastState().getLatitude(), 0.0) == 0
                    && Double.compare(asset.getLastState().getLongitude(), 0.0) == 0) {

                Optional<Asset> optAsset = assetsRepo.findById(asset.getName());
                if (optAsset.isPresent()) {
                    Asset assetToRemove = optAsset.get();
                    assetsRepo.delete(assetToRemove);
                }
            }
        });
    }
}
