package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.repo.VertProfilesRepo;

@RestController
public class SoiController {

	@Autowired
	AssetsRepository repo;

	@Autowired
	VertProfilesRepo vertProfiles;

	@RequestMapping(path = { "/soi/", "/soi" }, method = RequestMethod.GET)
	public List<Asset> listAssets() {
		ArrayList<Asset> assets = new ArrayList<>();
		repo.findAll().forEach(assets::add);
		return assets;
	}
	
	@RequestMapping(path = { "/soi/profiles", "/soi/profiles/" }, method = RequestMethod.GET)
	public List<VerticalProfileData> listProfiles() {
		ArrayList<VerticalProfileData> profs = new ArrayList<>();
		vertProfiles.findAll().forEach(profs::add);
		return profs;
	}
	

}
