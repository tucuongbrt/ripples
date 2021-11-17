package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.shared.Settings;
import pt.lsts.ripples.repo.main.SettingsRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class SettingsController {

    @Autowired
    SettingsRepository repo;

    private final Logger logger = LoggerFactory.getLogger(DomainController.class);

    @PostConstruct
    public void init() {
        String systemDomain = "Ripples";
        String paramKey = "Current domain";
        String paramVal = "";
        List<Settings> listSettings = repo.findByDomainName(systemDomain);
        if (listSettings.isEmpty()) {
            Settings newSetting = new Settings(systemDomain);
            List<String[]> params = new ArrayList<String[]>();
            String[] newParam = { paramKey, paramVal };
            params.add(newParam);
            newSetting.addParams(params);
            repo.save(newSetting);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/settings", "/settings/" }, method = RequestMethod.GET)
    public List<Settings> listSettings() {
        ArrayList<Settings> settingsList = new ArrayList<>();
        repo.findAll().forEach(settingsList::add);
        return settingsList;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/settings/{settingDomain}/{paramKey}",
            "/settings/{settingDomain}/{paramKey}/" }, method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<HTTPResponse> displayParam(@PathVariable String settingDomain,
            @PathVariable String paramKey) {

        String paramValue = "";
        List<Settings> listSettings = repo.findByDomainName(settingDomain);
        if (!listSettings.isEmpty()) {
            List<String[]> params = listSettings.get(0).getParams();
            for (String[] param : params) {
                if (param[0].equals(paramKey)) {
                    paramValue = param[1];
                }
            }
        }
        return new ResponseEntity<>(new HTTPResponse("Success", paramValue), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/settings/{settingDomain}" })
    public ResponseEntity<HTTPResponse> createSettingDomain(@PathVariable String settingDomain) {
        List<Settings> listSettings = repo.findByDomainName(settingDomain.trim());
        if (listSettings.isEmpty()) {
            Settings newSetting = new Settings(settingDomain);
            repo.save(newSetting);
            logger.info("Added setting domain: " + settingDomain);
            return new ResponseEntity<>(new HTTPResponse("Success", "Created setting domain"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Setting domain alread exist"), HttpStatus.OK);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/settings/update/{settingId}/{paramKey}" })
    public ResponseEntity<HTTPResponse> updateSetting(@PathVariable String settingId, @PathVariable String paramKey,
            @RequestBody String paramValue) {

        if (!paramValue.trim().equals("\"\"")) {
            paramValue = paramValue.replace("\"", "");
        }

        Optional<Settings> optsetting = repo.findById(Long.parseLong(settingId));

        if (optsetting.isPresent()) {
            Settings settingUpdate = optsetting.get();

            List<String[]> paramsUpdate = new ArrayList<String[]>();
            boolean settingInserted = false;

            // update existing param
            List<String[]> params = settingUpdate.getParams();
            for (String[] param : params) {
                if (param[0].equals(paramKey.trim())) {
                    String[] newParam = { param[0], paramValue.trim() };
                    paramsUpdate.add(newParam);
                    settingInserted = true;
                } else {
                    paramsUpdate.add(param);
                }
            }

            // insert new param
            if (!settingInserted) {
                String[] newParam = new String[2];
                newParam[0] = paramKey.trim();
                newParam[1] = paramValue.trim();
                paramsUpdate.add(newParam);
            }

            settingUpdate.addParams(paramsUpdate);
            repo.save(settingUpdate);

            logger.info("Settings updated: " + paramKey + " - " + paramValue);
            return new ResponseEntity<>(new HTTPResponse("Success", "Settings updated"), HttpStatus.OK);

        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update settings"), HttpStatus.OK);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @DeleteMapping(path = { "/settings/{settingId}/{paramKey}" })
    public ResponseEntity<HTTPResponse> removeSettingParam(@PathVariable String settingId,
            @PathVariable String paramKey) {

        Optional<Settings> optsetting = repo.findById(Long.parseLong(settingId));
        if (optsetting.isPresent()) {
            Settings settingUpdate = optsetting.get();

            List<String[]> paramsUpdate = new ArrayList<String[]>();

            // update existing param
            List<String[]> params = settingUpdate.getParams();
            for (String[] param : params) {
                if (!param[0].equals(paramKey)) {
                    paramsUpdate.add(param);
                }
            }

            settingUpdate.addParams(paramsUpdate);
            repo.save(settingUpdate);

            logger.info("Setting param removed: " + paramKey);
            return new ResponseEntity<>(new HTTPResponse("Success", "Settings param removed"), HttpStatus.OK);

        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Cannot remove settings param"), HttpStatus.OK);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @DeleteMapping(path = { "/settings/{settingId}" })
    public ResponseEntity<HTTPResponse> removeSettingDomain(@PathVariable String settingId) {

        Optional<Settings> optsetting = repo.findById(Long.parseLong(settingId));
        if (optsetting.isPresent()) {
            Settings setting = optsetting.get();
            repo.delete(setting);

            logger.info("Removed setting domain: " + setting.getName());
            return new ResponseEntity<>(new HTTPResponse("Success", "Settings domain removed"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Cannot remove settings domain"), HttpStatus.OK);
        }
    }

}
