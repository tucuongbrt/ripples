package pt.lsts.ripples.controllers;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.domain.shared.Domain;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.DomainRepository;
import pt.lsts.ripples.repo.main.UserRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class DomainController {

    @Autowired
    DomainRepository repo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetsRepository assetsRepository;

    private final Logger logger = LoggerFactory.getLogger(DomainController.class);

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/domain", "/domain/" }, method = RequestMethod.GET)
    public List<Domain> listDomains() {
        ArrayList<Domain> domainList = new ArrayList<>();
        repo.findAll().forEach(domainList::add);
        return domainList;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/domain/names", "/domain/names/" }, method = RequestMethod.GET)
    public List<String> listDomainsNames() {
        ArrayList<Domain> domainList = new ArrayList<>();
        repo.findAll().forEach(domainList::add);

        ArrayList<String> domainsName = new ArrayList<>();
        for (Domain d : domainList) {
            domainsName.add(d.getName());
        }

        return domainsName;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/domain/{name}" })
    public ResponseEntity<HTTPResponse> createDomain(@PathVariable String name) {
        List<Domain> domains = repo.findByName(name);
        if (domains.isEmpty()) {
            repo.save(new Domain(name));
            logger.info("Added domain: " + name);
            return new ResponseEntity<>(new HTTPResponse("Success", "Added domain"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Domain already exist. \nChoose another name"),
                    HttpStatus.OK);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/domain/{prevName}/{newName}" })
    public ResponseEntity<HTTPResponse> updateDomain(@PathVariable String prevName, @PathVariable String newName) {
        List<Domain> domains = repo.findByName(prevName);
        Optional<Domain> optDomain = repo.findById(domains.get(0).getId());
        if (optDomain.isPresent()) {
            Domain updateDomain = optDomain.get();
            updateDomain.setName(newName);
            repo.save(updateDomain);

            // update users and assets
            ArrayList<User> users = new ArrayList<>();
            userRepository.findAll().forEach(users::add);
            for (User u : users) {
                Collections.replaceAll(u.getDomain(), prevName, newName);
                userRepository.save(u);
            }

            ArrayList<Asset> assets = new ArrayList<>();
            assetsRepository.findAll().forEach(assets::add);
            for (Asset a : assets) {
                Collections.replaceAll(a.getDomain(), prevName, newName);
                assetsRepository.save(a);
            }

            logger.info("Updated domain: " + newName);
            return new ResponseEntity<>(new HTTPResponse("Success", "Domain updated"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update domain"), HttpStatus.OK);
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/domain/remove/{name}" })
    public ResponseEntity<HTTPResponse> deleteDomain(@PathVariable String name) {
        List<Domain> domains = repo.findByName(name);
        if (!domains.isEmpty()) {
            Optional<Domain> optDomain = repo.findById(domains.get(0).getId());
            if (optDomain.isPresent()) {
                repo.deleteById(domains.get(0).getId());

                // update users and assets
                ArrayList<User> users = new ArrayList<>();
                userRepository.findAll().forEach(users::add);
                for (User u : users) {
                    removeAll(u.getDomain(), name);
                    userRepository.save(u);
                }

                ArrayList<Asset> assets = new ArrayList<>();
                assetsRepository.findAll().forEach(assets::add);
                for (Asset a : assets) {
                    removeAll(a.getDomain(), name);
                    assetsRepository.save(a);
                }

                logger.info("Deleted domain: " + name);
                return new ResponseEntity<>(new HTTPResponse("Success", "Domain deleted"), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(new HTTPResponse("Error", "Cannot delete domain"), HttpStatus.OK);
            }
        } else {
            return new ResponseEntity<>(new HTTPResponse("Error", "Domain doesn't exit"), HttpStatus.OK);
        }
    }

    private List<String> removeAll(List<String> list, String name) {
        while (list.contains(name)) {
            list.remove(name);
        }
        return list;
    }

}
