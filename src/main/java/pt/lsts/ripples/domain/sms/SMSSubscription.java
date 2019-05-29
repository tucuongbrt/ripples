package pt.lsts.ripples.domain.sms;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class SMSSubscription {

    @Id
    private String phoneNumber;

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public SMSSubscription(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public SMSSubscription() {}
}