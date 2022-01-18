package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class SPAController {

    private static Logger logger = LoggerFactory.getLogger(RockBlockController.class);

    @RequestMapping(path = {"/", "/ripples", "/soirisk", "/messages/text", "/user/manager", "/settings/manager", "/settings/panel", "/user/profile"})
    public String index() {
        logger.info("On index()");
        return "forward:index.html";
    }

    @RequestMapping(path = "/oauth2/redirect")
    public ModelAndView index(@RequestParam String token) {
        logger.info("On oauth2 redirect");
        return new ModelAndView("forward:/index.html");
    }

}