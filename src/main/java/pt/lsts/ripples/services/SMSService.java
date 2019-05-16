package pt.lsts.ripples.services;

import java.util.ArrayList;

import javax.annotation.PostConstruct;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.springframework.stereotype.Service;

@Service
public class SMSService {
    private final String ACCOUNT_SID = "AC7c7cef0b44d66d50d5733695f50676c1";
    private final String AUTH_TOKEN = "1a407095fd3f022fbd008aa47d3ac787";
    private ArrayList<String> phonesList = new ArrayList<>(); 

    @PostConstruct
    public void initialize() {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    public void addPhoneNumber(String phoneNumber) {
        phonesList.add(phoneNumber);
    }

    public void sendMessage(String text) {
        phonesList.forEach(phone -> {
            Message.creator(
                new PhoneNumber(phone),
                new PhoneNumber("+19162974191"),
                text)
                .create();
        });

    }
}