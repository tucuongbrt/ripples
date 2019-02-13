package pt.lsts.ripples.iridium;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import pt.lsts.imc.SoiCommand;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.iridium.ImcIridiumMessage;

@Component
public class SoiInteraction {

	@Autowired
	RockBlockIridiumSender rockBlockService;

	private Logger logger = LoggerFactory.getLogger(SoiInteraction.class);

	// TODO: REVIEW THIS ID
	private int localId = 99;

	public void sendCommand(SoiCommand cmd, Asset asset) throws Exception {
		int payloadSize = cmd.getPayloadSize();
		logger.info("Payload size: " + payloadSize);
		if (payloadSize > 250) {
			throw new Exception("Max payload size reached");
		}
		ImcIridiumMessage msg = new ImcIridiumMessage();
		msg.setSource(localId);
		cmd.setSrc(localId);
		cmd.setDst(asset.getImcid());
		msg.setMsg(cmd);

		msg.setDestination(asset.getImcid());
		rockBlockService.sendMessage(msg);
		logger.info("Message sent");
	}

}
