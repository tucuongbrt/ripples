package pt.lsts.ripples.services;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.MediaType;
import okhttp3.RequestBody;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.minidev.json.JSONObject;
import org.json.JSONException;

@Service
public class ZerotierService {

    private final Logger logger = LoggerFactory.getLogger(ZerotierService.class);

    @Value("${zerotier.zt-central-url}")
    private String ZT_CENTRAL_URL;

    @Value("${zerotier.api-token}")
    private String apiToken;

    @Value("${zerotier.nwid}")
    private String nwid;

    private HttpUrl apiUrl;

    private OkHttpClient client;

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    @PostConstruct
    public void init() {
        this.apiUrl = HttpUrl.parse(ZT_CENTRAL_URL);
        Interceptor interceptor = new ZerotierService.RequestInterceptor(apiToken);
        this.client = new OkHttpClient.Builder().addInterceptor(interceptor).build();
    }

    public String getStatus() {
        final HttpUrl targetUrl = apiUrl.newBuilder().addPathSegment("status").build();
        final Request request = new Request.Builder().url(targetUrl).build();
        String json = makeRequest(request);
        return json;
    }

    public String joinNetwork(String nodeId, String username, String email) {
        final HttpUrl targetUrl = apiUrl.newBuilder().addPathSegment("network").addPathSegment(nwid)
                .addPathSegment("member").addPathSegment(nodeId).build();
        JSONObject nodeInfo = new JSONObject();
        try {
            nodeInfo.put("name", username);
            nodeInfo.put("description", email);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        final RequestBody body = RequestBody.create(JSON, nodeInfo.toString());
        final Request request = new Request.Builder().url(targetUrl).post(body).build();
        String json = makeRequest(request);
        logger.info("Node " + nodeId + " is joining the network...");
        return json;
    }

    public String makeRequest(Request request) {
        try {
            Response response = client.newCall(request).execute();
            if (response.isSuccessful()) {
                return response.body().string();
            } else {
                throw new IOException();
            }
        } catch (IOException e1) {
            // notification about other problems
        }
        return "";
    }

    class RequestInterceptor implements Interceptor {
        private String apiToken;

        public RequestInterceptor(String apiToken) {
            this.apiToken = apiToken;
        }

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request().newBuilder()
                    .addHeader("Authorization", String.format("Bearer %s", apiToken)).addHeader("X-ZT1-Auth", apiToken)
                    .build();
            return chain.proceed(request);
        }
    }
}