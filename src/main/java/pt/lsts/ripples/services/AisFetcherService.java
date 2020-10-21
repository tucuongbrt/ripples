package pt.lsts.ripples.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.util.Date;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PostConstruct;

import com.google.common.eventbus.Subscribe;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import dk.tbsalling.ais.tracker.AISTrack;
import dk.tbsalling.ais.tracker.AISTracker;
import dk.tbsalling.ais.tracker.events.AisTrackDynamicsUpdatedEvent;
import pt.lsts.ripples.controllers.WebSocketsController;
import pt.lsts.ripples.domain.shared.AISShip;
import pt.lsts.ripples.repo.main.AISRepository;

@Component
public class AisFetcherService {

    private Logger logger = LoggerFactory.getLogger(AisFetcherService.class);

    private AISTracker tracker = null;

    StringBuilder inputMessages = new StringBuilder();

    ByteArrayOutputStream out = new ByteArrayOutputStream();;


    @Autowired
    AISRepository repo;
    
    @Autowired
	WebSocketsController wsController;

    @Value("${udp.port: 5100}")
    private int port; 

    @PostConstruct
    public void init() throws IOException {
        logger.info("Started UDP listener on port: " + port);

        UDPListener client = new UDPListener();
        ExecutorService exec = Executors.newFixedThreadPool(1);
        exec.submit(client);
    }

    public class UDPListener implements Runnable {
        @Override
        public void run() {
            try (DatagramSocket socket = new DatagramSocket(port)) {
                byte[] buffer = new byte[255];
                while (true) {
                    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                    socket.receive(packet);
                    onDataReceived(packet);
                }
            } catch (Exception e) {
                logger.error(e.getMessage());
            }
        }
    }

    public void onDataReceived(DatagramPacket packet) throws IOException {

        out.write(packet.getData(), 0, packet.getLength());

        if(tracker == null){
            tracker = new AISTracker();
            tracker.registerSubscriber(this);
        }

        tracker.update(new ByteArrayInputStream(out.toByteArray()));
    }

    @Subscribe
    public void handleEvent(AisTrackDynamicsUpdatedEvent event) {
        sendData(event.getAisTrack());
    }
    
    private synchronized void sendData(AISTrack track) {
        if (track.getShipName() == null)
            return;

        AISShip ship = new AISShip();
        ship.setMmsi((int)track.getMmsi());
        ship.setName(track.getShipName());
        ship.setType(track.getShipType().getCode());
        ship.setLatitudeDegs(track.getLatitude().doubleValue());
        ship.setLongitudeDegs(track.getLongitude().doubleValue());
        ship.setCog(track.getCourseOverGround());
        ship.setSog(track.getSpeedOverGround().doubleValue());
        ship.setHeading(track.getTrueHeading().doubleValue());
        ship.setTimestamp(Date.from(track.getTimeOfLastUpdate()));
        ship.setBow(track.getToBow().doubleValue());
        ship.setStarboard(track.getToStarboard().doubleValue());
        ship.setPort(track.getToPort().doubleValue());
        ship.setStern(track.getToStern().doubleValue());

        if( coordsValid(ship.getLatitudeDegs(),ship.getLongitudeDegs()) ) {
            AISShip newAISShip = filterNewAISShip(ship);
            repo.save(newAISShip);
            wsController.sendAISUpdateFromServerToClient(newAISShip);
            logger.info("Sent " + newAISShip.toString());
        }
    }


    private boolean coordsValid(double latitude, double longitude) {
		return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
	}

    
    private AISShip filterNewAISShip(AISShip aisShip) {
		AISShip newAISShip = null;
		Optional<AISShip> optAIS = repo.findById(aisShip.getMmsi());
		if (optAIS.isPresent()) {
			if (optAIS.get().getTimestamp().before(aisShip.getTimestamp())) {
				newAISShip = aisShip;
			}
		} else {
			newAISShip = aisShip;
		}
		return newAISShip;
	}


}
