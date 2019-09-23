package pt.lsts.ripples.domain.iridium;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class IridiumSubscription {

    @Id
    @GeneratedValue
    Long id;

    private String imei;
    private Date deadline = new Date(System.currentTimeMillis() + 1000 * 3600 * 24);

    public String getImei() {
        return imei;
    }

    public void setImei(String imei) {
        this.imei = imei;
    }

    public Date getDeadline() {
        return deadline;
    }

    public void setDeadline(Date deadline) {
        this.deadline = deadline;
    }

    @Override
    public String toString() {
    	return "[Subscriber "+imei+" : "+deadline+"]";
    }
}
