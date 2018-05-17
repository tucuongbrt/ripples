package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.io.Serializable;

@Entity
public class Waypoint implements Serializable {

    @Id
    @GeneratedValue
    private long id;

    private double latitude;
    private double longitude;
    private double eta;
    private int duration;

    public Waypoint() {

    }

    public Waypoint(double lat, double lon, double eta, int duration) {
        this.latitude = lat;
        this.longitude = lon;
        this.eta = eta;
        this.duration = duration;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getEta() {
        return eta;
    }

    public void setEta(double eta) {
        this.eta = eta;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }
}
