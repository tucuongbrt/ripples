package pt.lsts.ripples.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pt.lsts.ripples.repo.main.SMSSubscriptionsRepository;

import javax.annotation.PostConstruct;

@Service
public class SMSService {
    @Value("${twilio.account-sid}")
    private String ACCOUNT_SID;
    @Value("${twilio.auth-token}")
    private String AUTH_TOKEN;
    @Autowired
    SMSSubscriptionsRepository smsSubscriptionsRepo;

    @PostConstruct
    public void initialize() {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    public void sendMessage(String text) {
        smsSubscriptionsRepo.findAll().forEach(subscription -> {
            Message.creator(
                new PhoneNumber(subscription.getPhoneNumber()),
                new PhoneNumber("+19162974191"),
                text)
                .create();
        });
        smsSubscriptionsRepo.deleteAll();
    }
}