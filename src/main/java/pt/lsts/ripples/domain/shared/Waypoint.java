package pt.lsts.ripples.domain.shared;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Waypoint implements Serializable {

    private static final long serialVersionUID = -550933491432200210L;

    @Id
    @GeneratedValue
    private long id;

    private double latitude;
    private double longitude;
    private long timestamp;
    private int duration;
    private int depth;

    public Waypoint() {

    }

    public Waypoint(double lat, double lon, long timestamp, int duration, int depth) {
        this.latitude = lat;
        this.longitude = lon;
        this.timestamp = timestamp;
        this.duration = duration;
        this.depth = depth;
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

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getDepth() {
        return depth;
    }

    public void setDepth(int depth) {
        this.depth = depth;
    }

    public Date getArrivalDate() {
        return new Date(timestamp * 1000l);
    }
}
