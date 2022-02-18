package pt.lsts.ripples.domain.shared;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.eclipsesource.json.JsonObject;

@Entity
public class PollutionSample {

    @Id
    @GeneratedValue
    private Long id;

    private double latitude;
    private double longitude;
    private String status;
    private Date timestamp;

    public PollutionSample() {

    }

    public PollutionSample(double lat, double lng, String status, Date timestamp) {
        this.latitude = lat;
        this.longitude = lng;
        this.status = status;
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        JsonObject json = new JsonObject();
        json.add("id", id);
        json.add("latitude", latitude);
        json.add("longitude", longitude);
        json.add("status", status);
        json.add("timestamp", timestamp.toString());
        return json.toString();
    }

    public Long getId() {
        return id;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double lat) {
        this.latitude = lat;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double lng) {
        this.longitude = lng;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

}
