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
import java.util.Arrays;
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
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.VertProfilesRepo;

@Component
public class WavysUpdater {

    @Autowired
    AssetsRepository assetsRepo;

    @Autowired
    VertProfilesRepo vertProfilesRepo;

    @Autowired
    WebSocketsController wsController;

    @Value("${wavy.username}")
    String username;

    @Value("${wavy.secret}")
    String secret;

    private Logger logger = LoggerFactory.getLogger(WavysUpdater.class);

    @Scheduled(cron = "0 0 * ? * *") // every hour
    public void deleteMapleOldAssets() {
        assetsRepo.findAll().forEach(asset -> {
            if (asset.getName().startsWith("MS-")) {
                long last24hours = Instant.now().minus(Duration.ofDays(1)).getEpochSecond();
                if (asset.getLastState().getTimestamp() < last24hours) {
                    assetsRepo.delete(asset);
                    logger.info("Deleted old maple asset - " + asset.getName());
                }
            }
        });
    }

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
        Instant queryTimestamp = Instant.now().minus(Duration.ofMinutes(60));

        try {
            String params = "{\"where\":{\"and\":[{\"timestamp\":{\"gt\":\"" + queryTimestamp
                    + "\"}},{\"position\":{\"neq\":\"null\"}},{\"serialNumber\":{}}]},\"fields\":[\"timestamp\",\"serialNumber\",\"position\",\"content\"],\"order\":[\"timestamp ASC\"]}";

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

                    // avoid timestamp bugs
                    Instant serverDate = Instant.now();
                    Instant wavyDate = Instant.parse(jsonobject.getString("timestamp"));

                    int value = serverDate.compareTo(wavyDate);
                    if (value > 0) { // serverTime greater
                        addWavy(jsonobject);
                        if (!wavyInserted.contains(jsonobject.getString("serialNumber"))) {
                            wavyInserted.add(jsonobject.getString("serialNumber"));
                        }
                        if (jsonobject.getString("serialNumber").startsWith("WO")) {
                            addWavyProfile(jsonobject);
                        }
                    }
                }
                logger.info("Readed " + jsonarray.length() + " wavys since " + queryTimestamp + ". Updated: "
                        + wavyInserted.toString() + "");

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

            List<String> domain = Arrays.asList("Meloa");
            newAsset.setDomain(domain);
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

    private void addWavyProfile(JSONObject jsonobject) {
        DateTime wavyDate = DateTime.parse(jsonobject.getString("timestamp"));
        DateTime lisbonCurrentDate = wavyDate.toDateTime(DateTimeZone.forID("Europe/Lisbon"));
        Date currentDate = lisbonCurrentDate.toDate();

        JSONObject posObject = (JSONObject) jsonobject.get("position");
        String[] contentParts = jsonobject.getString("content").split("\\|");

        if (!profileAlreadyExists(currentDate, posObject.getDouble("lat"), posObject.getDouble("lng"))) {
            VerticalProfileData data = new VerticalProfileData();
            data.setSystem(jsonobject.getString("serialNumber"));
            data.setTimestamp(currentDate);
            data.setLatitude(posObject.getDouble("lat"));
            data.setLongitude(posObject.getDouble("lng"));

            List<Double[]> sampleList = new ArrayList<Double[]>();
            if (contentParts.length > 14) {
                if (contentParts[13] != null && contentParts[13].length() > 0) {
                    double temp1 = Double.parseDouble(contentParts[13]);
                    if (temp1 > -90 && temp1 < 90) {
                        sampleList.add(new Double[] { 0.0, temp1 });
                    }
                }
                if (contentParts[14] != null && contentParts[14].length() > 0) {
                    double temp2 = Double.parseDouble(contentParts[14]);
                    if (temp2 > -90 && temp2 < 90) {
                        sampleList.add(new Double[] { 1.0, temp2 });
                    }
                }
            }

            // avoid bugs in samples
            if (!sampleList.isEmpty()) {
                data.setSamples(sampleList);
                logger.info("Added temperature profile: " + data.toString());
                vertProfilesRepo.save(data);
            } else {
                logger.info("Invalid samples: " + jsonobject.getString("serialNumber"));
            }
        }
    }

    private Boolean profileAlreadyExists(Date timestamp, Double lat, Double lng) {
        ArrayList<VerticalProfileData> profiles = new ArrayList<>();
        vertProfilesRepo.findAll().forEach(profiles::add);
        for (VerticalProfileData profile : profiles) {
            if (Double.compare(profile.latitude, lat) == 0 && Double.compare(profile.longitude, lng) == 0
                    && profile.timestamp.getTime() == timestamp.getTime()) {
                return true;
            }
        }
        return false;
    }
}
