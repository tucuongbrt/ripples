package pt.lsts.ripples.controllers;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.EnvDataRepository;

@RestController()
public class WgState {

	@Autowired
	EnvDataRepository repo;

	@RequestMapping(value = "/wg.json", produces = "application/json")
	public EnvDatum getState(HttpServletResponse response) {
		return repo.findTopBySourceOrderByTimestampDesc("wg-sv3-127").get(0);		
	}
}
