package pt.lsts.ripples.services;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import pt.lsts.ripples.domain.shared.APIKey;
import pt.lsts.ripples.repo.main.ApiKeyRepository;

@Service
public class ApiKeyService {

    @Autowired
    ApiKeyRepository repoApiKey;

    @Value("${apikeys.secret}")
    String appSecret;

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

    public List<String> getTokenDomain(String token) {
        Optional<APIKey> apiKey = repoApiKey.findById(token);
        if(apiKey.isPresent()) {
            return apiKey.get().getDomain();
        }
        return null;
    }

    public boolean isTokenValid(String token) {
        ArrayList<APIKey> apiKeyList = new ArrayList<>();
        repoApiKey.findAll().forEach(apiKeyList::add);
        for (int i = 0; i < apiKeyList.size(); i++) {
            byte[] salt_db = apiKeyList.get(i).getSalt();
            String token_db = apiKeyList.get(i).getToken();

            try {
                byte[] token_aux = generateToken(salt_db, appSecret);
                String token_aux_string = Base64.getEncoder().encodeToString(token_aux);

                if (token_aux_string.equals(token) && token_db.equals(token)) {
                    return true;
                }
            } catch (Exception e) {
                // TODO: handle exception
            }
        }

        return false;
    }

    public boolean isTokenReadable(String token) {
        ArrayList<APIKey> apiKeyList = new ArrayList<>();
        repoApiKey.findAll().forEach(apiKeyList::add);
        for (int i = 0; i < apiKeyList.size(); i++) {
            byte[] salt_db = apiKeyList.get(i).getSalt();
            String token_db = apiKeyList.get(i).getToken();
            try {
                byte[] token_aux = generateToken(salt_db, appSecret);
                String token_aux_string = Base64.getEncoder().encodeToString(token_aux);

                if (token_aux_string.equals(token) && token_db.equals(token)
                        && apiKeyList.get(i).getPermission().contains("read")) {
                    return true;
                }
            } catch (NoSuchAlgorithmException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        return false;
    }

    public boolean isTokenWriteable(String token) {
        ArrayList<APIKey> apiKeyList = new ArrayList<>();
        repoApiKey.findAll().forEach(apiKeyList::add);
        for (int i = 0; i < apiKeyList.size(); i++) {
            byte[] salt_db = apiKeyList.get(i).getSalt();
            String token_db = apiKeyList.get(i).getToken();
            try {
                byte[] token_aux = generateToken(salt_db, appSecret);
                String token_aux_string = Base64.getEncoder().encodeToString(token_aux);

                if (token_aux_string.equals(token) && token_db.equals(token)
                        && apiKeyList.get(i).getPermission().contains("write")) {
                    return true;
                }
            } catch (NoSuchAlgorithmException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        return false;
    }

}
