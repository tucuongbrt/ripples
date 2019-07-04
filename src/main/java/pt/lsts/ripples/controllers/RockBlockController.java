package pt.lsts.ripples.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.domain.iridium.Rock7Message;
import pt.lsts.ripples.iridium.IridiumMessage;
import pt.lsts.ripples.iridium.RockBlockIridiumSender;
import pt.lsts.ripples.repo.Rock7Repository;
import pt.lsts.ripples.services.MessageProcessor;

import javax.xml.bind.annotation.adapters.HexBinaryAdapter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;


@RestController
public class RockBlockController {

	private static final HexBinaryAdapter hexAdapter = new HexBinaryAdapter();
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yy-MM-dd HH:mm:ss");

	private static Logger logger = LoggerFactory.getLogger(RockBlockController.class);

	static {
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));

	}

	@Autowired
	Rock7Repository repo;

	@Autowired
	private MessageProcessor msgProcessor;

	@Autowired
	private RockBlockIridiumSender rockBlockService;

	@GetMapping(path = "/api/v1/iridium")
	public List<Rock7Message> pollMessages(@RequestParam(defaultValue="-3600") long since) {
		since *= 1000;
		
		if (since < 0)
			since += System.currentTimeMillis();

		Date d = new Date(since);
		return repo.findSince(d);
	}

    @GetMapping(path = "/api/v1/iridium/plaintext")
    public List<Rock7Message> pollPlainTextMessages() {
        Date d = new Date(System.currentTimeMillis() - 1000 * 24 * 3600);
        return repo.findPlainTextSince(d);
    }

	/**
	 * Gateway that saves a message and redirects it to the rockBlock HTTP API.
	 * @param body
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	@PostMapping(path = {"/api/v1/iridium", "/api/v1/irsim"}, consumes = "application/hub")
	public ResponseEntity sendMessage(@RequestBody String body) {
		IridiumMessage msg;
		try {
			msg = IridiumMessage.deserialize(hexAdapter.unmarshal(body));
		}
		catch (Exception e) {
			e.printStackTrace();
		    return new ResponseEntity<>(e.getClass().getSimpleName() + ": deserialize Iridium message error",
			HttpStatus.INTERNAL_SERVER_ERROR);
		}
		logger.info("api/v1/iridium: " + msg.toString());
		logger.info("msgType:" + msg.message_type);
		int dst = msg.getDestination();
		int src = msg.getSource();
		logger.info("Message dst: " + dst + "; msg src: "  + src);
		Rock7Message m = new Rock7Message();
		m.setType(msg.getMessageType());
		m.setDestination(dst);
		m.setSource(src);
		m.setMsg(body);
		m.setCreated_at(new Date(msg.timestampMillis));
		m.setUpdated_at(new Date());
		m.setPlainText(msg.getMessageType() == -1);

		repo.save(m);

		msgProcessor.process(msg);
		try {
			rockBlockService.sendMessage(msg); // redirect message to rockBlock
		} catch(Exception e){
			logger.warn(e.getLocalizedMessage());
			return new ResponseEntity<>(e.getClass().getSimpleName() + ": redirect Iridium message error",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>("Message posted to Ripples", HttpStatus.OK);
	} 	


	@PostMapping(path = "/rock7")
	public ResponseEntity<String> postMessage(@RequestParam String imei,
			@RequestParam String transmit_time, @RequestParam String data) {

		if (data.isEmpty()){
			return new ResponseEntity<>("Received empty message", HttpStatus.OK);
		}

		Date timestamp = new Date();

		try {
			timestamp = dateFormat.parse(transmit_time);
		} catch (Exception e) {
			logger.warn("Unable to parse date");
			return new ResponseEntity<String>("Unable to parse the date.", HttpStatus.BAD_REQUEST);
		}

		Rock7Message m = new Rock7Message();
		m.setImei(imei);
		m.setCreated_at(timestamp);
		m.setUpdated_at(new Date());
		m.setMsg(data);

		IridiumMessage msg;
		try {
			byte[] body = hexAdapter.unmarshal(data);
			msg = IridiumMessage.deserialize(body);
			// try to parse message as an IridiumMessage object
			m.setType(msg.getMessageType());
			m.setSource(msg.getSource());
			m.setDestination(msg.getDestination());
			m.setPlainText(msg.getMessageType() == -1);
		} catch (Exception e) {
		    e.printStackTrace();
			logger.warn("Unable to parse message data:" + e.getMessage());
			return new ResponseEntity<String>(
					"Unable to parse message data:" + e.getMessage(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		repo.save(m);
		// process incoming message
		if (msg != null)
			msgProcessor.process(msg);


		return new ResponseEntity<String>("Message received successfully.", HttpStatus.OK);
	}
	
	public static void main(String[] args) {
		long since = -3600;
		since = (System.currentTimeMillis() + (since * 1000)) / 1000;
		System.out.println(since);
		System.out.println(System.currentTimeMillis());
	}
}
