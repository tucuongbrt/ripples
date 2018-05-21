package pt.lsts.ripples.controllers;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import javax.xml.bind.annotation.adapters.HexBinaryAdapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.iridium.Rock7Message;
import pt.lsts.ripples.iridium.IridiumMessage;
import pt.lsts.ripples.repo.AddressesRepository;
import pt.lsts.ripples.repo.Rock7Repository;
import pt.lsts.ripples.services.MessageProcessor;


@RestController
public class RockBlockController {

	private static final HexBinaryAdapter hexAdapter = new HexBinaryAdapter();
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yy-MM-dd HH:mm:ss");
	private static Pattern p = Pattern.compile("\\((.)\\) \\((.*)\\) (.*) / (.*), (.*) / .*");

	static {
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));

	}

	@Autowired
	Rock7Repository repo;

	@Autowired
	private MessageProcessor msgProcessor;

	@Autowired
	private AddressesRepository addresses;

	@GetMapping(path = "/api/v1/iridium")
	public List<Rock7Message> pollMessages() {
		Date d = new Date(System.currentTimeMillis() - 1000 * 24 * 3600);
		return repo.findSince(d);
	}

	@SuppressWarnings("rawtypes")
	@PostMapping(path = {"/api/v1/iridium", "/api/v1/irsim"}, consumes = "application/hub")
	public ResponseEntity sendMessage(@RequestBody String body) {

		try {
			byte[] data = hexAdapter.unmarshal(body);
			IridiumMessage msg = IridiumMessage.deserialize(data);

			int dst = msg.getDestination();
			int src = msg.getSource();

			Rock7Message m = new Rock7Message();
			m.setType(msg.getMessageType());
			m.setDestination(dst);
			m.setSource(src);
			m.setMsg(body);
			m.setCreated_at(new Date(msg.timestampMillis));
			m.setUpdated_at(new Date());

			repo.save(m);

			msgProcessor.process("", msg);
			return new ResponseEntity("Message posted to Ripples", HttpStatus.OK);

		} catch (Exception e) {
			Logger.getLogger(getClass().getName()).log(Level.WARNING,
					"Error sending Iridium message", e);

			return new ResponseEntity(e.getClass().getSimpleName() + " while sending Iridium message",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}


	@PostMapping(path = "/rock7")
	public ResponseEntity postMessage(@RequestParam String imei,
			@RequestParam String transmit_time, @RequestParam String data) {

		Date timestamp = new Date();

		try {
			timestamp = dateFormat.parse(transmit_time);
		} catch (Exception e) {
			Logger.getLogger(getClass().getName()).warning("Unable to parse date");
			return new ResponseEntity("Unable to parse the date.", HttpStatus.BAD_REQUEST);
		}

		Rock7Message m = new Rock7Message();
		m.setImei(imei);
		m.setCreated_at(timestamp);
		m.setUpdated_at(new Date());
		m.setMsg(data);

		IridiumMessage msg = null;
		try {
			// try to parse message as an IridiumMessage object
			msg = IridiumMessage.deserialize(hexAdapter.unmarshal(data));
			m.setType(msg.getMessageType());
			m.setSource(msg.getSource());
			m.setDestination(msg.getDestination());
		} catch (Exception e) {
			Logger.getLogger(getClass().getName()).warning("Unable to parse message data");
			m.setType(-1);
		}

		System.out.println("Received message from RockBlock: " + m);

		// Save message to repository
		repo.save(m);

		// process incoming message
		if (msg != null)
			msgProcessor.process(imei, msg);


		return new ResponseEntity("Message received successfully.", HttpStatus.OK);
	}
}