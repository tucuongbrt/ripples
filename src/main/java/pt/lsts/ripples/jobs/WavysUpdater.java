package pt.lsts.ripples.jobs;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.utils.URIBuilder;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.controllers.WebSocketsController;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.repo.main.AssetsRepository;

@Component
public class WavysUpdater {

    @Autowired
    AssetsRepository assetsRepo;

    @Autowired
    WebSocketsController wsController;

    @Value("${wavy.username}")
    String username;

    @Value("${wavy.secret}")
    String secret;

    private Logger logger = LoggerFactory.getLogger(WavysUpdater.class);

    @Scheduled(fixedRate = 360_000) // each 6 minutes
    public void updateWavys() throws ClientProtocolException, IOException {
        String userID = getUserID();
        if (userID != null) {
            getWavys(userID);
        } else {
            logger.info("Error getting userID...");
        }
    }

    private String getUserID() {
        URL url;
        try {
            url = new URL("https://meloa.inesctec.pt/api/users/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "*/*");
            conn.setDoOutput(true);

            String jsonInputString = "{\"username\": \"" + username + "\", \"password\": \"" + secret + "\"}";

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                JSONObject obj = new JSONObject(response.toString());

                conn.disconnect();
                return obj.getString("id");
            }

        } catch (MalformedURLException e) {
            e.printStackTrace();
            return null;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void getWavys(String userID) {
        Instant queryTimestamp = Instant.now().minus(Duration.ofMinutes(10));

        try {
            String params = "{\"where\":{\"and\":[{\"timestamp\":{\"gt\":\"" + queryTimestamp
                    + "\"}},{\"position\":{\"neq\":\"null\"}},{\"serialNumber\":{}}]},\"fields\":[\"timestamp\",\"serialNumber\",\"position\",\"content\"],\"order\":[\"timestamp DESC\"]}";

            URIBuilder b = new URIBuilder("https://meloa.inesctec.pt/api/realtime_observations");
            b.addParameter("filter", params);
            URL url = b.build().toURL();

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", userID);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "*/*");
            conn.setDoOutput(true);

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }

                JSONArray jsonarray = new JSONArray(response.toString());

                List<String> wavyInserted = new ArrayList<String>();
                for (int i = 0; i < jsonarray.length(); i++) {
                    JSONObject jsonobject = jsonarray.getJSONObject(i);
                    if (!wavyInserted.contains(jsonobject.getString("serialNumber"))) {
                        addWavy(jsonobject);
                        wavyInserted.add(jsonobject.getString("serialNumber"));
                    }
                }
                logger.info("Read " + jsonarray.length() + " wavys. Updated: " + wavyInserted.toString() + "");

                br.close();
                conn.disconnect();
            }
        } catch (Exception e) {
            logger.info("Error getting wavys. UserID: " + userID);
            e.printStackTrace();
        }
    }

    private void addWavy(JSONObject jsonobject) {
        DateTime wavyDate = DateTime.parse(jsonobject.getString("timestamp"));
        DateTime lisbonCurrentDate = wavyDate.toDateTime(DateTimeZone.forID("Europe/Lisbon"));
        Date currentDate = lisbonCurrentDate.toDate();

        // Instant wavyTimestamp = Instant.parse(jsonobject.getString("timestamp"));
        // Date currentDate = Date.from(wavyTimestamp);

        JSONObject posObject = (JSONObject) jsonobject.get("position");

        Optional<Asset> optAsset = assetsRepo.findById(jsonobject.getString("serialNumber"));
        if (!optAsset.isPresent()) {
            Asset newAsset = new Asset(jsonobject.getString("serialNumber"));

            AssetState state = new AssetState();
            state.setDate(currentDate);
            state.setLatitude(posObject.getDouble("lat"));
            state.setLongitude(posObject.getDouble("lng"));
            state.setFuel(0);
            state.setHeading(0);

            newAsset.setLastState(state);

            assetsRepo.save(newAsset);
            wsController.sendAssetUpdateFromServerToClients(newAsset);
        } else {
            Asset oldAsset = optAsset.get();
            oldAsset.getLastState().setDate(currentDate);
            oldAsset.getLastState().setLatitude(posObject.getDouble("lat"));
            oldAsset.getLastState().setLongitude(posObject.getDouble("lng"));

            assetsRepo.save(oldAsset);
            // wsController.sendAssetUpdateFromServerToClients(oldAsset);
        }

    }
}
