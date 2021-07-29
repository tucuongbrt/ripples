package pt.lsts.ripples.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.ripples.domain.shared.Settings;
import pt.lsts.ripples.repo.main.SettingsRepository;

@Service
public class SettingsService {

    @Autowired
    SettingsRepository settingsRepo;

    public String getProfilesDisplayTime() {
        List<Settings> listSettings = settingsRepo.findByDomainName("Ripples");
        if (!listSettings.isEmpty()) {
            List<String[]> params = listSettings.get(0).getParams();
            for (String[] param : params) {
                if (param[0].contains("Display profiles")) {
                    return param[1];
                }
            }
        }
        return null;
    }

}
