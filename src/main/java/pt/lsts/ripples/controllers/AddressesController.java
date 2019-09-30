package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.repo.main.AddressesRepository;

@RestController
public class AddressesController {

    @Autowired
    AddressesRepository repo;

    @GetMapping({"/addresses", "/addresses/"})
    public Iterable<SystemAddress> listAddresses() {
        return repo.findAll();
    }
}
