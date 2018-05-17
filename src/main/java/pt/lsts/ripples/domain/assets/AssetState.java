package pt.lsts.ripples.domain.assets;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Date;

@Entity
public class AssetState implements Serializable {

    @Id
    @GeneratedValue
    private Long id;
    private double latitude;
    private double longitude;
    private double heading;
    private double fuel;
    private int timestamp;

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

    public double getHeading() {
        return heading;
    }

    public void setHeading(double heading) {
        this.heading = heading;
    }

    public double getFuel() {
        return fuel;
    }

    public void setFuel(double fuel) {
        this.fuel = fuel;
    }

    public int getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(int timestamp) {
        this.timestamp = timestamp;
    }

    @JsonIgnore
    public Date getDate() {
        return new Date(this.timestamp * 1000l);
    }

    @JsonIgnore
    public void setDate(Date timestamp) {
        this.timestamp = (int) (timestamp.getTime() / 1000);
    }
}
