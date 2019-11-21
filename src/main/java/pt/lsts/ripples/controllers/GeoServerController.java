package pt.lsts.ripples.controllers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.bind.DatatypeConverter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import pt.lsts.ripples.domain.maps.GeoLayer;
import pt.lsts.ripples.repo.main.GeoServerRepo;

@RestController
public class GeoServerController {

    @Autowired
    GeoServerRepo geoServerRepo;

    @Value("${geoserver.url:#{null}}")
    String geoServerUrl;

    @Value("${geoserver.user}")
    String geoServerUser;

    @Value("${geoserver.pass}")
    String geoServerPass;

    @Scheduled(fixedRate = 60_000)
    public void updateLayers() {
        // Fetch all GeoServer layers
        List<JSONObject> geoLayersObjs = this.fetchGeoServerLayers();
        if (geoLayersObjs == null) {
            return;
        }
        geoLayersObjs.forEach(layerObj -> {
            String pattern = "(.+):(.+)";
            Pattern r = Pattern.compile(pattern);
            Matcher m = r.matcher(layerObj.get("name").toString());
            if (m.find() && m.groupCount() == 2) {
                String group = m.group(1);
                String name = m.group(2);
                geoServerRepo.save(new GeoLayer(group, name));
            }
        });
    }

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
    @GetMapping(path = { "/geoserver", "/geoserver/" }, produces = "application/json")
    public @ResponseBody String fetchGeoServerAddr() {
        return "{\"url\":\"" + geoServerUrl + "\"}";
    }

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
    @GetMapping(path = { "/geolayers", "/geolayers/" }, produces = "application/json")
    public List<GeoLayer> fetchGeoLayersNames() {
        List<GeoLayer> layers = new ArrayList<GeoLayer>();
        geoServerRepo.findAll().forEach(layers::add);
        return layers;
    }

    private List<JSONObject> fetchGeoServerLayers() {
        if (geoServerUrl == null) {
            return null;
        }
        try {
            URL layersUrl = new URL(geoServerUrl + "/rest/layers.json");
            HttpURLConnection con = (HttpURLConnection) layersUrl.openConnection();

            con.setRequestMethod("GET");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            String userPass = String.format("%s:%s", geoServerUser, geoServerPass);
            String basicAuth = "Basic " + DatatypeConverter.printBase64Binary(userPass.getBytes());
            con.setRequestProperty("Authorization", basicAuth);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String line;
            StringBuffer response = new StringBuffer();
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();
            con.disconnect();

            JSONParser parser = new JSONParser(JSONParser.MODE_JSON_SIMPLE);
            JSONObject json = (JSONObject) parser.parse(response.toString());
            List<JSONObject> layers = this.getGeoLayersJsonObject((JSONObject) json.get("layers"));

            return layers;
        } catch (Exception e) {
            return null;
        }
    }

    public List<JSONObject> getGeoLayersJsonObject(JSONObject layersJsonObj) {
        JSONArray layerJsonArr = (JSONArray) layersJsonObj.get("layer");
        ArrayList<JSONObject> layersObjs = new ArrayList<JSONObject>();
        for (int i = 0; i < layerJsonArr.size(); i++) {
            JSONObject currentObj = (JSONObject) layerJsonArr.get(i);
            layersObjs.add(currentObj);
        }
        return layersObjs;
    }
}
