package pt.lsts.ripples.jobs;

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


    @Scheduled(fixedRate = 600_000)
    public void updateUsers() {
        try{
            List<List<Object>> values = googleSheetsService.run();
            for (List row : values) {
                // Print columns A and B, which correspond to indices 0 and 1.
                System.out.printf("%s, %s\n", row.get(0), row.get(1));
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

    private void updateUser(User user, List row) {
        user.setEmail((String)row.get(0));
        user.setRole((String)row.get(1));
        user.setName((String)row.get(2));
        user.setEmailVerified(true);
        user.setProvider(AuthProvider.google);
        usersRepo.save(user);
    }
}
