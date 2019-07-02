package pt.lsts.ripples.jobs;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.annotation.PostConstruct;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.iridium.Rock7Account;
import pt.lsts.ripples.repo.Rock7AccountsRepository;

@Component
public class Rock7AccountsUpdater {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(Rock7AccountsUpdater.class);

    @Autowired
    Rock7AccountsRepository accountsRepo;

    @PostConstruct
    public void initialization() {
        try {
            updateRock7Accounts();
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

    }

    @Scheduled(fixedRate = 600_000)
    private void updateRock7Accounts() throws Exception {
        InputStream addrs = new ClassPathResource("rock7accounts.tsv").getInputStream();

        BufferedReader buffer = new BufferedReader(new InputStreamReader(addrs));
        buffer.lines().forEach(l -> {
            String[] parts = l.split("\t");
            if (parts.length == 2) {
                String email = parts[0].trim();
                String password = parts[1].trim();
                if (!accountsRepo.findById(email).isPresent()) {
                    logger.info("Saving rock7 account: " + email);
                    accountsRepo.save(new Rock7Account(email, password));
                }
            }

        });
    }
}