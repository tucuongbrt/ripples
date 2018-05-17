package pt.lsts.ripples.controllers;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.logging.Logger;
import java.util.zip.ZipInputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MyMapsController {

	@Value("${kmz.url}")
	private String url;
	
    @GetMapping(path = {"/kml", "/kml/*"}, produces = "text/plain")
    public ResponseEntity<String> getKml() {
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

            return new ResponseEntity<>(new String(out.toByteArray()), HttpStatus.OK);
        } catch (Exception e) {
            Logger.getLogger(getClass().getSimpleName()).warning("Could not get map from Google MyMaps");
            return new ResponseEntity<>("Could not load map", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
