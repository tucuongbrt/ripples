package pt.lsts.ripples.controllers;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.imc.IMCDefinition;
import pt.lsts.imc.IMCMessage;
import pt.lsts.ripples.services.MessageProcessor;

/**
 * Receive IMC messages from client proxies
 */
@RestController
public class IMCReceiverController {

	@Autowired
	MessageProcessor processor;

	private Logger logger = LoggerFactory.getLogger(IMCReceiverController.class);

	@PostMapping(path = { "/imc/announce",
			"/imc/announce/" }, consumes = "application/hub", produces = "application/json")
	public ResponseEntity<String> setAssetIMCPosition(@RequestBody byte[] body) {
		try {
			IMCMessage msg = this.deserializeIMC(body);
			logger.info(msg.asJSON());
			processor.on(msg);
			return new ResponseEntity<>("Message received successfully.", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	private IMCMessage deserializeIMC(byte[] buff) throws IOException {
		// not sure about IMCDefinition.getInstance()
		IMCMessage msg = IMCDefinition.getInstance().parseMessage(buff);
		return msg;

	}
}