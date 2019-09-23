/*
 * Copyright (c) 2004-2019 Universidade do Porto - Faculdade de Engenharia
 * Laboratório de Sistemas e Tecnologia Subaquática (LSTS)
 * All rights reserved.
 * Rua Dr. Roberto Frias s/n, sala I203, 4200-465 Porto, Portugal
 *
 * This file is part of Neptus, Command and Control Framework.
 *
 * Commercial Licence Usage
 * Licencees holding valid commercial Neptus licences may use this file
 * in accordance with the commercial licence agreement provided with the
 * Software or, alternatively, in accordance with the terms contained in a
 * written agreement between you and Universidade do Porto. For licensing
 * terms, conditions, and further information contact lsts@fe.up.pt.
 *
 * Modified European Union Public Licence - EUPL v.1.1 Usage
 * Alternatively, this file may be used under the terms of the Modified EUPL,
 * Version 1.1 only (the "Licence"), appearing in the file LICENSE.md
 * included in the packaging of this file. You may not use this work
 * except in compliance with the Licence. Unless required by applicable
 * law or agreed to in writing, software distributed under the Licence is
 * distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific
 * language governing permissions and limitations at
 * https://github.com/LSTS/neptus/blob/develop/LICENSE.md
 * and http://ec.europa.eu/idabc/eupl.html.
 *
 * For more information please see <http://lsts.fe.up.pt/neptus>.
 *
 * Author: zp
 * Jun 28, 2013
 */
package pt.lsts.ripples.iridium;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import javax.net.ssl.SSLContext;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.message.BasicNameValuePair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.iridium.Rock7Account;
import pt.lsts.ripples.domain.soi.IncomingMessage;
import pt.lsts.ripples.repo.AddressesRepository;
import pt.lsts.ripples.repo.IncomingMessagesRepository;
import pt.lsts.ripples.repo.Rock7AccountsRepository;
import pt.lsts.ripples.util.ByteUtil;
import org.apache.commons.codec.binary.Hex;

/**
 * This class uses the RockBlock HTTP API (directly) to send messages to Iridium
 * destinations and a gmail inbox to poll for incoming messages
 * 
 * @see http://rockblock.rock7mobile.com/downloads/RockBLOCK-Web-Services-User-Guide.pdf
 * @author zp
 */
// Sends Iridium messages directly via RockBlock web service
@Service
public class RockBlockIridiumSender {

    protected boolean available = true;
    protected static String serverUrl = "https://secure.rock7mobile.com/rockblock/MT";
    private static long lastSuccess = -1;

    private static Logger logger = LoggerFactory.getLogger(RockBlockIridiumSender.class);

    @Autowired
    Rock7AccountsRepository rock7AccountsRepo;

    @Autowired
    AddressesRepository addressesRepo;

    @Autowired
    IncomingMessagesRepository messagesRepository;

    // save message for simulation purposes
    private void saveMessage(IridiumMessage msg, String assetName) {
        IncomingMessage incomingMsg = new IncomingMessage();
        try {
            incomingMsg.setMessage(Hex.encodeHexString(msg.serialize()));
            incomingMsg.setAssetName(assetName);
            incomingMsg.setTimestampMs(msg.timestampMillis);
            messagesRepository.save(incomingMsg);
        } catch (Exception e) {
            logger.warn(e.getLocalizedMessage());
        }

    }

    public void sendMessage(IridiumMessage msg) throws Exception {

        SystemAddress system = addressesRepo.findByImcId(msg.getDestination());
        if (system == null || system.getImei() == null || system.getRock7Email() == null) {
        	logger.warn("Not sending "+msg.getClass().getSimpleName()+" to unknown destination: "+system);
        	return;
        }
        Rock7Account rock7Account = rock7AccountsRepo.findById(system.getRock7Email()).get();
        saveMessage(msg, system.getName());
        logger.info("Trying to send rockblock message using account: " + rock7Account.getEmail());
        String result = sendToRockBlockHttp(system.getImei(), rock7Account, msg.serialize());

        if (result != null) {
            if (!result.split(",")[0].equals("OK")) {
                throw new Exception("RockBlock server failed to deliver the message: '" + result + "'");
            }
        }
    }

    static final SSLConnectionSocketFactory sslsf;
    static final Registry<ConnectionSocketFactory> registry;
    static final PoolingHttpClientConnectionManager cm;
    
    static {
        
        try {
            sslsf = new SSLConnectionSocketFactory(SSLContext.getDefault(),
                    NoopHostnameVerifier.INSTANCE);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", new PlainConnectionSocketFactory())
                .register("https", sslsf)
                .build();
        cm = new PoolingHttpClientConnectionManager(registry);
        cm.setMaxTotal(100);
    }
    
    public static String sendToRockBlockHttp(String destImei, Rock7Account rock7Account, byte[] data)
            throws IOException {

        HttpClient client = HttpClients.custom()
                .setSSLSocketFactory(sslsf)
                .setConnectionManager(cm)
                .build();
                

        HttpPost post = new HttpPost(serverUrl);
        List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
        urlParameters.add(new BasicNameValuePair("imei", destImei));
        urlParameters.add(new BasicNameValuePair("username", rock7Account.getEmail()));
        urlParameters.add(new BasicNameValuePair("password", rock7Account.getPassword()));
        urlParameters.add(new BasicNameValuePair("data", ByteUtil.encodeToHex(data)));
        
        

        post.setEntity(new UrlEncodedFormEntity(urlParameters));
        post.setHeader("Content-Type", "application/x-www-form-urlencoded");
        HttpResponse response = client.execute(post);

        BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

        StringBuffer result = new StringBuffer();
        String line = "";
        while ((line = rd.readLine()) != null) {
            result.append(line);
        }
        
        return result.toString();
    }

    public static Future<Boolean> rockBlockIsReachable() {
        return new Future<Boolean>() {
            Boolean result = null;
            boolean canceled = false;
            long start = System.currentTimeMillis();
            {

                if (System.currentTimeMillis() - lastSuccess < 15000) {
                    result = true;
                }

                try {
                    URL url = new URL("https://secure.rock7mobile.com/rockblock");
                    int len = url.openConnection().getContentLength();
                    if (len > 0)
                        lastSuccess = System.currentTimeMillis();
                    result = len > 0;
                }
                catch (Exception e) {
                    logger.error(e.getMessage());
                    result = false;
                }
            }

            @Override
            public Boolean get() throws InterruptedException, ExecutionException {
                while (result == null) {
                    Thread.sleep(100);
                }
                return result;
            }

            @Override
            public boolean cancel(boolean mayInterruptIfRunning) {
                canceled = true;
                return false;
            }

            @Override
            public Boolean get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException,
                    TimeoutException {
                while (result == null) {
                    Thread.sleep(100);
                    if (System.currentTimeMillis() - start > unit.toMillis(timeout))
                        throw new TimeoutException("Time out while connecting");
                }
                return result;
            }

            @Override
            public boolean isCancelled() {
                return canceled;
            }

            @Override
            public boolean isDone() {
                return result != null;
            }
        };
    }
    
}
