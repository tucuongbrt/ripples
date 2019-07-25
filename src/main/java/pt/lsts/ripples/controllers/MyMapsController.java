package pt.lsts.ripples.controllers;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.zip.ZipInputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.maps.MyMaps;
import pt.lsts.ripples.repo.MyMapsRepository;

@RestController
public class MyMapsController {

    @Autowired
    MyMapsRepository myMapsRepo;

    @PostMapping(path = {"/kml", "/kml/"}, consumes = "application/json")
    public ResponseEntity<String> addKML(@RequestBody MyMaps newMap) {
        // newMap should have a url and a name
        System.out.println("Received new map " + newMap.getName() + " " + newMap.getUrl());
        myMapsRepo.save(newMap);
        return new ResponseEntity<>("Added KML map", HttpStatus.OK);
    }

    @DeleteMapping(path = {"/kml/{mapName}", "/kml/{mapName}/"}, produces = "text/plain")
    public ResponseEntity<String> deleteKML(@PathVariable("mapName") String mapName) {
        myMapsRepo.deleteById(mapName);
        return new ResponseEntity<>("map " + mapName + " was deleted", HttpStatus.OK);
    }
	
    @GetMapping(path = {"/kml/{mapName}", "/kml/{mapName}/"}, produces = "text/plain")
    public ResponseEntity<String> getKML(@PathVariable("mapName") String mapName) {
        if (mapName == null)
            return new ResponseEntity<>("/kml/{mapName}", HttpStatus.INTERNAL_SERVER_ERROR);
        
        Optional<MyMaps> optMyMap = myMapsRepo.findById(mapName);
        if (!optMyMap.isPresent())
            return new ResponseEntity<>("map not found", HttpStatus.NOT_FOUND);
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
        
        return new ResponseEntity<>(myMap.getData(), HttpStatus.OK);
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
