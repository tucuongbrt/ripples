package pt.lsts.ripples.domain.shared;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class AssetPosition {

    @Id
    @GeneratedValue
    private Long id;

    @JsonProperty("imcId")
    private int imcId;
    private Date timestamp;
    private double lat;
    private double lon;
    private String name;

    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }

    public int getImcId() {
        return imcId;
    }

    public void setImcId(int imcId) {
        this.imcId = imcId;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void update(UserLocation location) {
        this.setLat(location.getLatitude());
        this.setLon(location.getLongitude());
        this.setTimestamp(location.getTimestamp());
    }

    public String toString() {
		return "{ lat: " + lat + ", lng: " + lon + " }";
	}
}
