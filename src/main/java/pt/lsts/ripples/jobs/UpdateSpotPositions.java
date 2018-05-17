package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.services.MessageProcessor;
import pt.lsts.ripples.services.Resolver;

import javax.annotation.PostConstruct;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.logging.Logger;

@Component
public class UpdateSpotPositions {

    @Autowired
    AssetsRepository assets;

    @Autowired
    MessageProcessor msgProcessor;

    @Autowired
    Resolver nameResolver;

    @PostConstruct
    @Scheduled(fixedRate = 60_000)
    public void updateSpots() {
        try {
            Logger.getLogger(getClass().getSimpleName()).info("Updating SPOT tag positions...");
            
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            
            DocumentBuilder db = dbf.newDocumentBuilder();
            URL url = new URL(
                    "https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0qQz420UTPODTjoHylgIOPa3RqqvOhkMK/message.xml");
            URLConnection conn = url.openConnection();
            conn.setUseCaches(false);
            conn.connect();
            Document doc = db.parse(conn.getInputStream());
            
            LinkedHashMap<String, AssetPosition> positions = new LinkedHashMap<String, AssetPosition>();
            
            NodeList messages = doc.getElementsByTagName("message");
            for (int i = 0; i < messages.getLength(); i++) {
                NodeList elems = messages.item(i).getChildNodes();
                String name = null;
                double lat = 0, lon = 0;
                long timestamp = System.currentTimeMillis();
                for (int j = elems.getLength() - 1; j >= 0; j--) {
                    Node nd = elems.item(j);
                    switch (nd.getNodeName()) {
                        case "unixTime":
                            timestamp = Long.parseLong(nd.getTextContent()) * 1000;
                            break;
                        case "latitude":
                            lat = Double.parseDouble(nd.getTextContent());
                            break;
                        case "longitude":
                            lon = Double.parseDouble(nd.getTextContent());
                            break;
                        case "messengerName":
                            name = nd.getTextContent().toLowerCase();
                            break;
                        default:
                            break;
                    }
                }
                
                int imc_id = nameResolver.resolve(name);
                
                AssetPosition pos = new AssetPosition();
                pos.setName(name);
                pos.setImcId(imc_id);
                pos.setLat(lat);
                pos.setLon(lon);
                pos.setTimestamp(new Date(timestamp));
                
                if (!positions.containsKey(name) || positions.get(name).getTimestamp().before(pos.getTimestamp()))
                    positions.put(name, pos);
            }
            
            positions.values().forEach(p -> msgProcessor.setAssetPosition(p));
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}
