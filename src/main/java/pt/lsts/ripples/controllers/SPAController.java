package pt.lsts.ripples.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SPAController {

    @RequestMapping(path = {"/", "/ripples", "/soirisk", "/messages/text"})
    public String index() {
        return "index.html";
    }
}