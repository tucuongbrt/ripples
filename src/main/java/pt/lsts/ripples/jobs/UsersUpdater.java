package pt.lsts.ripples.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.lsts.ripples.domain.security.AuthProvider;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.repo.UserRepository;
import pt.lsts.ripples.services.GoogleSheetsService;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Optional;

@Component
public class UsersUpdater {

    @Autowired
    GoogleSheetsService googleSheetsService;

    @Autowired
    UserRepository usersRepo;

    private final Logger logger = LoggerFactory.getLogger(UsersUpdater.class);


    @Scheduled(fixedRate = 600_000) // each 10 minutes
    public void updateUsers() {
        try{
            List<List<Object>> values = googleSheetsService.run();
            for (List row : values) {
                Optional<User> byEmail = usersRepo.findByEmail((String) row.get(0));
                if (!byEmail.isPresent()){
                    updateUser(new User(), row);
                } else {
                    updateUser(byEmail.get(), row);
                }
            }
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Scheduled(fixedRate = 1296_000_000) // each 15 days
    public void clearUsers() {
        logger.info("Deleted all users");
        usersRepo.deleteAll();
        updateUsers();
    }

    private void updateUser(User user, List row) {
        user.setEmail((String)row.get(0));
        user.setRole((String)row.get(1));
        user.setName((String)row.get(2));
        user.setEmailVerified(true);
        user.setProvider(AuthProvider.google);
        logger.info("Adding user: " + user.getEmail());
        usersRepo.save(user);
    }
}
