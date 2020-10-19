package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetParams;
import pt.lsts.ripples.domain.shared.UserLocation;
import pt.lsts.ripples.domain.logbook.MyAnnotation;
import pt.lsts.ripples.domain.shared.AISShip;

@Component
public class WebSocketsController {

	
	@Autowired
    private SimpMessagingTemplate template;

	@Autowired
    public WebSocketsController(SimpMessagingTemplate template) {
        this.template = template;
    }

	// the business logic can call this to update all connected clients
    public void sendAssetUpdateFromServerToClients(Asset asset) {
        // logger.info("Broadcasting update for asset " + asset.getName());
        this.template.convertAndSend("/topic/asset", asset);
    }

    public void sendAISUpdateFromServerToClient(AISShip aisShip) {
        this.template.convertAndSend("/topic/ais", aisShip);
    }

    public void sendAnnotationUpdate(MyAnnotation annotation) {
        this.template.convertAndSend("/topic/logbook", annotation);
    }

	public void sendUserLocationUpdate(UserLocation location) {
        this.template.convertAndSend("/topic/users/location", location);
	}

	public void sendAssetParamsUpdateFromServerToClients(AssetParams params) {
        this.template.convertAndSend("/topic/assets/params", params);
    }
/*
    public void sendAISRealTimeUpdateFromServerToClient(AISShip aisShip){
        this.template.convertAndSend("/topic/ais/realTime" , aisShip); 
    }
*/
}