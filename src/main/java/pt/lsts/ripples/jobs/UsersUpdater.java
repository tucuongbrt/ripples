package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pt.lsts.ripples.domain.security.AuthProvider;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.repo.UserRepository;
import pt.lsts.ripples.services.SheetsQuickstart;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Optional;

@Component
public class UsersUpdater {

    @Autowired
    SheetsQuickstart sheetsQuickstart;

    @Autowired
    UserRepository usersRepo;


    @Scheduled(fixedRate = 600_000)
    public void updateUsers() {
        try{
            List<List<Object>> values = sheetsQuickstart.run();
            for (List row : values) {
                // Print columns A and B, which correspond to indices 0 and 1.
                System.out.printf("%s, %s\n", row.get(0), row.get(1));
                Optional<User> byEmail = usersRepo.findByEmail((String) row.get(0));
                if (!byEmail.isPresent()){
                    User newUser = new User();
                    newUser.setEmail((String)row.get(0));
                    newUser.setRole((String)row.get(1));
                    newUser.setName((String)row.get(2));
                    newUser.setEmailVerified(true);
                    newUser.setProvider(AuthProvider.google);
                    usersRepo.save(newUser);
                }
            }
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
