package pt.lsts.ripples.services;

import java.util.ArrayList;
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

    public List<String> getCurrentDomain() {
        List<String> domain = new ArrayList<>();
        List<Settings> listSettings = settingsRepo.findByDomainName("Ripples");
        if (!listSettings.isEmpty()) {
            List<String[]> params = listSettings.get(0).getParams();
            for (String[] param : params) {
                if (param[0].equals("Current domain")) {
                    if (!param[1].equals("\"\"")) {
                        if (param[1].contains(",")) {
                            String[] parts = param[1].split(",");
                            for (String p : parts) {
                                domain.add(p);
                            }
                        } else {
                            domain.add(param[1]);
                        }

                    }
                }
            }
        }
        return domain;
    }

    public String getAssetsDisplayTime() {
        List<Settings> listSettings = settingsRepo.findByDomainName("Ripples");
        if (!listSettings.isEmpty()) {
            List<String[]> params = listSettings.get(0).getParams();
            for (String[] param : params) {
                if (param[0].contains("Display assets")) {
                    return param[1];
                }
            }
        }
        return null;
    }

}
