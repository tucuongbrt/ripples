package pt.lsts.ripples.controllers;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.zip.ZipInputStream;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.maps.MyMaps;
import pt.lsts.ripples.repo.main.MyMapsRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class MyMapsController {

    @Autowired
    MyMapsRepository myMapsRepo;

    @Value("${kml.name}")
    String defaultKMLName;

    @Value("${kml.url}")
    String defaultKMLUrl;

    @PostConstruct
    public void init() {
        String data = fetchMap(defaultKMLUrl);
        MyMaps defaultMap = new MyMaps(defaultKMLName, defaultKMLUrl);
        defaultMap.setData(data);
        defaultMap.setLastUpdate(new Date());
        myMapsRepo.save(defaultMap);
    }

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/kml", "/kml/" }, consumes = "application/json", produces = "application/json")
    public ResponseEntity<HTTPResponse> addKML(@RequestBody MyMaps newMap) {
        Optional<MyMaps> optMyMap = myMapsRepo.findById(newMap.getName());

        String baseURL = "https://www.google.com/maps/d/u/0/kml?";
        String mapID = newMap.getUrl().substring(newMap.getUrl().lastIndexOf("?") + 1);
        String mapURL = baseURL + mapID;

        if (optMyMap.isPresent()) {
            return new ResponseEntity<>(new HTTPResponse("error", "KML map already exist"), HttpStatus.OK);
        } else {
            // newMap should have a url and a name
            System.out.println("Received new map " + newMap.getName() + " " + newMap.getUrl());
            String mapData = fetchMap(mapURL);
            if (mapData != null) {
                newMap.setData(mapData);
                newMap.setUrl(mapURL);
                newMap.setLastUpdate(new Date());
                myMapsRepo.save(newMap);
                return new ResponseEntity<>(new HTTPResponse("success", "Added KML map"), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(new HTTPResponse("error", "Could not fetch map"), HttpStatus.OK);
            }
        }
    }

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
    @DeleteMapping(path = { "/kml/{mapName}", "/kml/{mapName}/" }, produces = "application/json")
    public ResponseEntity<HTTPResponse> deleteKML(@PathVariable("mapName") String mapName) {
        myMapsRepo.deleteById(mapName);
        return new ResponseEntity<>(new HTTPResponse("success", "map " + mapName + " was deleted"), HttpStatus.OK);
    }

    @GetMapping(path = { "/kml/{mapName}", "/kml/{mapName}/" }, produces = "application/json")
    public ResponseEntity<HTTPResponse> getKML(@PathVariable("mapName") String mapName) {
        if (mapName == null)
            return new ResponseEntity<>(new HTTPResponse("error", "use /kml/{mapName}"),
                    HttpStatus.INTERNAL_SERVER_ERROR);

        Optional<MyMaps> optMyMap = myMapsRepo.findById(mapName);
        if (!optMyMap.isPresent())
            return new ResponseEntity<>(new HTTPResponse("error", "map not found"), HttpStatus.NOT_FOUND);
        MyMaps myMap = optMyMap.get();
        LocalDateTime dateTime = LocalDateTime.now().minusMinutes(10);
        Date tenMinAgo = Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
        if (myMap.getLastUpdate().before(tenMinAgo)) {
            // map has not been updated in the last 10min, so lets update it
            String mapData = this.fetchMap(myMap.getUrl());
            myMap.setData(mapData);
            myMap.setLastUpdate(new Date());
            myMapsRepo.save(myMap);
        }

        return new ResponseEntity<>(new HTTPResponse("success", myMap.getData()), HttpStatus.OK);
    }

    @GetMapping(path = { "/kml/names", "/kml/names/" }, produces = "application/json")
    public ArrayList<String> getMyMapsNames() {
        ArrayList<String> mapNames = new ArrayList<String>();
        myMapsRepo.findAll().forEach(map -> {
            mapNames.add(map.getName());
        });
        return mapNames;
    }

    @GetMapping(path = { "/kml", "/kml/" }, produces = "application/json")
    public ArrayList<MyMaps> getMyMaps() {
        ArrayList<MyMaps> maps = new ArrayList<>();
        myMapsRepo.findAll().forEach(map -> {
            maps.add(map);
        });
        return maps;
    }

    @GetMapping(path = { "/kml/domain/maps/{userDomain}",
            "/kml/domain/maps/{userDomain}/" }, produces = "application/json")
    public ArrayList<MyMaps> getMyMapsByDomain(@PathVariable String[] userDomain) {
        ArrayList<MyMaps> maps = new ArrayList<>();
        myMapsRepo.findAll().forEach(map -> {
            if (map.getDomain().size() == 0 && !maps.contains(map)) {
                maps.add(map);
            } else {
                for (String d : userDomain) {
                    if (map.getDomain().contains(d) && !maps.contains(map)) {
                        maps.add(map);
                    }
                }
            }
        });
        return maps;
    }

    @GetMapping(path = { "/kml/domain/names/{userDomain}",
            "/kml/domain/names/{userDomain}/" }, produces = "application/json")
    public ArrayList<String> getMyMapsNamesByDomain(@PathVariable String[] userDomain) {
        ArrayList<String> mapNames = new ArrayList<String>();
        myMapsRepo.findAll().forEach(map -> {
            if (map.getDomain().size() == 0 && !mapNames.contains(map.getName())) {
                mapNames.add(map.getName());
            } else {
                for (String d : userDomain) {
                    if (map.getDomain().contains(d) && !mapNames.contains(map.getName())) {
                        mapNames.add(map.getName());
                    }
                }
            }
        });
        return mapNames;
    }

    @GetMapping(path = { "/kml/domain/{mapName}", "/kml/domain/{mapName}/" })
    public List<String> getMapDomain(@PathVariable String mapName) {
        List<String> mapDomain = new ArrayList<>();
        Optional<MyMaps> optMyMap = myMapsRepo.findById(mapName);
        if (optMyMap.isPresent()) {
            MyMaps newMap = optMyMap.get();
            mapDomain = newMap.getDomain();
        }
        return mapDomain;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/kml/{mapName}", "/kml/{mapName}/" })
    public ResponseEntity<HTTPResponse> addKMLDomain(@PathVariable String mapName, @RequestBody String[] payload) {

        Optional<MyMaps> optMyMap = myMapsRepo.findById(mapName);
        if (optMyMap.isPresent()) {
            List<String> mapDomain = new ArrayList<>(Arrays.asList(payload));
            MyMaps newMap = optMyMap.get();
            newMap.setDomain(mapDomain);
            newMap.setLastUpdate(new Date());
            myMapsRepo.save(newMap);
            return new ResponseEntity<>(new HTTPResponse("success", "Updated KML map domain"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new HTTPResponse("error", "Could not update map domain"), HttpStatus.OK);
        }
    }

    private String fetchMap(String url) {
        try {
            URL mapsUrl = new URL(url);
            URLConnection conn = mapsUrl.openConnection();

            conn.setUseCaches(false);
            ZipInputStream zis = new ZipInputStream(conn.getInputStream());
            zis.getNextEntry();

            InputStream in = zis;

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            byte[] buffer = new byte[1024 * 1024];
            int len = in.read(buffer);
            while (len != -1) {
                out.write(buffer, 0, len);
                len = in.read(buffer);
            }
            zis.close();
            out.close();

            return new String(out.toByteArray());
        } catch (Exception e) {
            Logger.getLogger(getClass().getSimpleName()).warning("Could not get map from Google MyMaps");
            return null;
        }
    }
}
