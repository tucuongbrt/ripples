package pt.lsts.ripples.jobs;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.repo.AddressesRepository;

@Component
public class UpdateAddresses {

	@Value("${skip.db.initialization:false}")
	boolean skip_initialization;
	
	private static final String location = "https://raw.githubusercontent.com/LSTS/imc/master/IMC_Addresses.xml";

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(UpdateAddresses.class);

    @Autowired
    AddressesRepository repo;

    @PostConstruct
    public void initialization() {
    	/*
    	if (skip_initialization) {
			Logger.getLogger(getClass().getSimpleName()).info("Skipping DB initialization");
			return;
		}
		*/
    	updateImcAddresses();
    	setSailDroneAddresses();
    	try {
    	    setWavyAddresses();
        } catch (Exception e){
            logger.warn(e.getMessage());
        }
    }
    
    @Scheduled(fixedRate = 600_000)
    public void updateImcAddresses() {
        try {
            logger.info("Updating IMC addresses...");
            
            URL url = new URL(location);
            
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(url.openStream());
            
            NodeList addresses = doc.getElementsByTagName("address");
            int count = 0;
            for (int i = 0; i < addresses.getLength(); i++) {
                Node nd = addresses.item(i);
                
                String idHex = nd.getAttributes().getNamedItem("id")
                        .getTextContent();
                String name = nd.getAttributes().getNamedItem("name")
                        .getTextContent();
                long id = Long.parseLong(idHex.replaceAll("0x", ""), 16);
                
                if (id == 0)
                    continue;
                
                SystemAddress addr = repo.findByImcId((int) id);
                
                if (addr == null) {
                    addr = new SystemAddress(name);
                    addr.setImcId((int) id);
                }
                repo.save(addr);
                count++;
            }
            
            Logger.getLogger(getClass().getName()).info("Stored " + count + " addresses in the datastore.");
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void setSailDroneAddresses() {
    	SystemAddress s1 = repo.findById("saildrone-1001").orElse(new SystemAddress("saildrone-1001"));
    	SystemAddress s2 = repo.findById("saildrone-1004").orElse(new SystemAddress("saildrone-1004"));
    	s1.setImcId(10251);
    	s2.setImcId(10252);
    	
    	repo.save(s1);
    	repo.save(s2);    	
    }

    public void setWavyAddresses() throws Exception {
        InputStream addrs = new ClassPathResource("addresses.tsv").getInputStream();

        try (BufferedReader buffer = new BufferedReader(new InputStreamReader(addrs))) {
            buffer.lines().forEach(l -> {
                String[] parts = l.split("\t");

                System.out.println(Arrays.asList(parts));

                String name = parts[0];

                SystemAddress addr = repo.findById(name).orElse(null);

                if (addr == null) {
                    addr = new SystemAddress(name);
                    if (name.startsWith("wavy")) {
                        addr.setImcId(0x8500 + Integer.parseInt(name.substring(5)));
                    }
                }

                if (!parts[1].trim().isEmpty()) {
                    addr.setImei(parts[1].trim());
                }

                if (parts.length > 2 && !parts[2].trim().isEmpty()) {
                    addr.setPhone(parts[2].trim());
                }

                if (parts.length > 3 && !parts[3].trim().isEmpty()) {
                    addr.setRock7Email(parts[3].trim());
                }

                repo.save(addr);
            });
        }
    }
}
