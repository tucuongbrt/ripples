package pt.lsts.ripples.services;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Date;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PostConstruct;

import com.google.common.eventbus.Subscribe;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    private static final int port = 5000;
    // private static final String host = "localhost";

    private AISTracker tracker = null;

    StringBuilder inputMessages = new StringBuilder();

    NumberFormat nf = new DecimalFormat("#0.00000");

    private String nmea = "!AIVDM,2,1,5,B,53AkSB02=:9TuaaR2210uDj0htELDptE8r22221J40=5566d0822DU4j0C4p,0*07\n" +
    "!AIVDM,2,2,5,B,88888888880,2*22\n" +
    "!AIVDM,1,1,,A,15Mv5v?P00IS0J`A86KTROvN0<5k,0*12\n" +
    "!AIVDM,1,1,,A,15Mwd<PP00ISfGpA7jBr??vP0<3:,0*04\n" +
    "!AIVDM,1,1,,A,13HOI:0P0000VOHLCnHQKwvL05Ip,0*23\n" +
    "!AIVDM,1,1,,A,133sVfPP00PD>hRMDH@jNOvN20S8,0*7F\n" +
    "!AIVDM,1,1,,B,100h00PP0@PHFV`Mg5gTH?vNPUIp,0*3B\n" +
    "!AIVDM,1,1,,B,13eaJF0P00Qd388Eew6aagvH85Ip,0*45\n" +
    "!AIVDM,1,1,,A,14eGrSPP00ncMJTO5C6aBwvP2D0?,0*7A\n" +
    "!AIVDM,1,1,,A,15MrVH0000KH<:V:NtBLoqFP2H9:,0*2F\n" +
    "!AIVDM,1,1,,A,15N9NLPP01IS<RFF7fLVmgvN00Rv,0*7F\n" +
    "!AIVDM,1,1,,A,133w;`PP00PCqghMcqNqdOvPR5Ip,0*65\n" +
    "!AIVDM,1,1,,B,35Mtp?0016J5ohD?ofRWSF2R0000,0*28\n" +
    "!AIVDM,1,1,,A,133REv0P00P=K?TMDH6P0?vN289>,0*46\n" +
    "!AIVDM,2,1,4,B,55MwW7P00001L@?;GS0<51B08Thj0TdpE800000P0hD556IE07RlSm6P0000,0*0B\n" +
    "!AIVDM,2,2,4,B,00000000000,2*23\n" +
    "!AIVDM,1,1,,B,139eb:PP00PIHDNMdd6@0?vN2D2s,0*43\n" +
    "!AIVDM,1,1,,B,33aDqfhP00PD2OnMDdF@QOvN205A,0*13\n" +
    "!AIVDM,1,1,,A,33AkSB0PAKPhQ@dPo@3BiQsP011Q,0*4E\n" +
    "!AIVDM,1,1,,B,B43JRq00LhTWc5VejDI>wwWUoP06,0*29\n" +
    "!AIVDM,1,1,,B,133hGvP0000CjLHMG0u==:VN05Ip,0*61\n" +
    "!AIVDM,1,1,,A,13aEOK?P00PD2wVMdLDRhgvL289?,0*26\n" +
    "!AIVDM,1,1,,B,16S`2cPP00a3UF6EKT@2:?vOr0S2,0*00\n" +
    "!AIVDM,2,1,9,B,53nFBv01SJ<thHp6220H4heHTf2222222222221?50:454o<`9QSlUDp,0*09\n" +
    "!AIVDM,2,2,9,B,888888888888880,2*2E\n" +
    "!AIVDM,1,1,,A,13AwPr00000pFa0P7InJL5JP2<0I,0*79\n" +
    "!AIVDM,1,1,,A,14eGKMhP00rkraHJPivPFwvL0<0<,0*23\n" +
    "!AIVDM,1,1,,B,13P:`4hP00OwbPRMN8p7ggvN0<0h,0*69\n" +
    "!AIVDM,1,1,,A,16:=?;0P00`SstvFnFbeGH6L088h,0*44\n" +
    "!AIVDM,1,1,,A,16`l:v8P0W8Vw>fDVB0t8OvJ0H;9,0*0A\n" +
    "!AIVDM,1,1,,A,169a:nP01g`hm4pB7:E0;@0L088i,0*5E\n" +
    "!AIVDM,1,1,,A,169F<h0P1S8hsm0B:H9o4gvN2@8o,0*5E\n" +
    "!AIVDM,1,1,,A,139f0`0P00PFDVvMag8a`gvP20T;,0*67\n" +
    "!AIVDM,1,1,,B,17u>=L001KR><?EfhW37iVFL05Ip,0*1D\n" +
    "!AIVDM,1,1,,A,16:>Pv002B8hjC6AjP9SCBNN05Ip,0*10\n" +
    "!AIVDM,1,1,,B,B6:io8@0=21k=`3C:eDJSww4SP00,0*68\n" +
    "!AIVDM,1,1,,B,36:RS:001?87bnt=:rq68TnN00nh,0*20\n" +
    "!AIVDM,2,1,6,B,56:fS:D0000000000008v0<QD4r0`T4v3400000t0`D147?ps1P00000,0*3D\n" +
    "!AIVDM,2,2,6,B,000000000000008,2*29\n" +
    "!AIVDM,1,1,,A,369AM`1P028d;40Aohk1EgvN2000,0*72\n" +
    "!AIVDM,1,1,,B,16:fRwOP1=87S3R=<JbLMwvL0<3v,0*59\n";


    @Autowired
    AISRepository repo;
    
    @Autowired
	WebSocketsController wsController;


    @PostConstruct
    public void init() {
        logger.info("Started UPD listener on port: " + port);
        
        UdpListenner client = new UdpListenner();
        ExecutorService exec = Executors.newFixedThreadPool(1);
        exec.submit(client);
    }

    public class UdpListenner implements Runnable {
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
        String data = new String(packet.getData(), 0, packet.getLength());
        logger.info(String.format("UDP packet received: %s", data));

        //inputMessages.append(nmea);
        inputMessages.append(data);

        if(tracker == null){
            tracker = new AISTracker();
            tracker.registerSubscriber(this);
        }
        tracker.update(new ByteArrayInputStream(inputMessages.toString().getBytes()));
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
        ship.setLatitudeDegs(Double.parseDouble(nf.format(track.getLatitude())));
        ship.setLongitudeDegs(Double.parseDouble(nf.format(track.getLongitude())));
        ship.setCog(track.getCourseOverGround());
        ship.setSog(Double.parseDouble(nf.format(track.getSpeedOverGround())));
        ship.setHeading(track.getTrueHeading().doubleValue());
        ship.setTimestamp(Date.from(track.getTimeOfLastUpdate()));
        ship.setBow(track.getToBow().doubleValue());
        ship.setStarboard(track.getToStarboard().doubleValue());
        ship.setPort(track.getToPort().doubleValue());
        ship.setStern(track.getToStern().doubleValue());

        if( coordsValid(ship.getLatitudeDegs(),ship.getLongitudeDegs()) ) {
            AISShip newAISShip = filterNewAISShip(ship);
            //repo.save(newAISShip);
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
