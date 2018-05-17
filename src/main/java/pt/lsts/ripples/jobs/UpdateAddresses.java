package pt.lsts.ripples.jobs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.repo.AddressesRepository;

import javax.annotation.PostConstruct;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.logging.Logger;

@Component
public class UpdateAddresses {

    private static final String location = "https://raw.githubusercontent.com/LSTS/imc/master/IMC_Addresses.xml";

    @Autowired
    AddressesRepository repo;

    @PostConstruct
    @Scheduled(fixedRate = 600_000)
    public void updateImcAddresses() {
        try {
            Logger.getLogger(getClass().getName()).info("Updating IMC addresses...");
            
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

    @PostConstruct
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
                repo.save(addr);
            });
        }
    }
}
