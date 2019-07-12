package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.Asset;

@Component
public class WebSocketsController {

	private static Logger logger = LoggerFactory.getLogger(SoiController.class);
	
	@Autowired
    private SimpMessagingTemplate template;

	@Autowired
    public WebSocketsController(SimpMessagingTemplate template) {
        this.template = template;
    }

	// the business logic can call this to update all connected clients
    public void sendAssetUpdateFromServerToClients(Asset asset) {
        logger.info("Sending asset update for asset " + asset.getName());
        logger.info(asset.getName() + ", lat:" + asset.getLastState().getLatitude()
        + ", lng:" + asset.getLastState().getLongitude());
        this.template.convertAndSend("/topic/asset", asset);
    }
}