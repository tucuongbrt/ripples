package pt.lsts.ripples.controllers;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.shared.APIKey;
import pt.lsts.ripples.repo.main.ApiKeyRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class ApiKeyController {

    @Autowired
    private ApiKeyRepository repo;

    @Value("${apikeys.secret}")
    String appSecret;

    @Value("${apikeys.salt}")
    String salt_len;

    private final Logger logger = LoggerFactory.getLogger(ApiKeyController.class);

    @Scheduled(cron = "0 0 0 * * ?") // every day
    public void removeExpiredApiKeys() {
        LocalDate currentDate_aux = LocalDate.now();
        Date currentDate = Date.from(currentDate_aux.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        repo.findAll().forEach(apiKey -> {
            if(currentDate.after(apiKey.getExpirationDate())) {
                repo.delete(apiKey);
                logger.info("API key expired: " + apiKey.getToken());
            }
        });        
    }

    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('OPERATOR') or hasRole('SCIENTIST')")
    @RequestMapping(path = { "/apikey", "/apikey/" }, method = RequestMethod.GET)
    public List<HashMap<String, Object>> listApiKeys() {
        List<HashMap<String, Object>> listApiKeys = new ArrayList<HashMap<String, Object>>();
        repo.findAll().forEach(apiKey -> {
            HashMap<String, Object> apiKeyMap = new HashMap<>();
            apiKeyMap.put("token", apiKey.getToken());
            apiKeyMap.put("email", apiKey.getEmail());
            apiKeyMap.put("domain", apiKey.getDomain());
            apiKeyMap.put("permission", apiKey.getPermission());
            apiKeyMap.put("expirationDate", apiKey.getExpirationDate());
            listApiKeys.add(apiKeyMap);
        });

        return listApiKeys;
    }


    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/apikey" })
    public ResponseEntity<HTTPResponse> createApiKey(@RequestBody APIKey payload) throws NoSuchAlgorithmException {
        byte[] salt = generateSalt(Integer.parseInt(salt_len));
        byte[] token = generateToken(salt, appSecret);
        String tokenToString = Base64.getEncoder().encodeToString(token);
        LocalDate date_aux = LocalDate.now().plusDays(90);
        Date expirationDate = Date.from(date_aux.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());

        APIKey apiKey = new APIKey();
        apiKey.setEmail(payload.getEmail());
        apiKey.setDomain(payload.getDomain());
        apiKey.setPermission(payload.getPermission());
        apiKey.setExpirationDate(expirationDate);
        apiKey.setToken(tokenToString);
        apiKey.setSalt(salt);
        repo.save(apiKey);

        String apiKeyToSend = Base64.getEncoder().encodeToString(token);

        logger.info("Created API key: " + apiKeyToSend);
        return new ResponseEntity<>(new HTTPResponse("Success", "Created API key:" + apiKeyToSend), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping(path = { "/apikey/remove" })
    public ResponseEntity<HTTPResponse> removeApiKey(@RequestBody String token) {
        token = token.substring(1, token.length() - 1);

        ArrayList<APIKey> apiKeyList = new ArrayList<>();
        repo.findAll().forEach(apiKeyList::add);
        for (int i = 0; i < apiKeyList.size(); i++) {
            String token_db = apiKeyList.get(i).getToken();
            if (token_db.equals(token)) {
                logger.info("API key deleted: " + token);
                repo.delete(apiKeyList.get(i));
                return new ResponseEntity<>(new HTTPResponse("Success", "API key removed"), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot remove API key"), HttpStatus.OK);
    }

    public static byte[] generateToken(byte[] salt, String secret) throws NoSuchAlgorithmException {
        MessageDigest md5Digest = MessageDigest.getInstance("SHA-256");
        md5Digest.update(salt);
        md5Digest.update(secret.getBytes());

        byte[] tokenValue = md5Digest.digest();
        return tokenValue;
    }

    public static byte[] generateSalt(Integer len) {
        SecureRandom random = new SecureRandom();
        byte bytes[] = new byte[len];
        random.nextBytes(bytes);
        return bytes;
    }

}
