package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;

import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.MessageMapping;

@Controller
public class NeptusController {

    private static Logger logger = LoggerFactory.getLogger(NeptusController.class);

    @MessageMapping("/neptus")
    public void netptusController(@Payload String msg) {
        logger.info("1- " + msg);
    }


}
