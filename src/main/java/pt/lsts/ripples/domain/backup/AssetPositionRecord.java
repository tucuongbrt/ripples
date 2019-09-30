package pt.lsts.ripples.domain.backup;

import java.util.Date;

import javax.persistence.Entity;

import pt.lsts.ripples.domain.assets.AssetPosition;

@Entity
public class AssetPositionRecord extends BackupRecord {

    private int imcId;
    private Date timestamp;
    private double lat;
    private double lon;
    private String name;

    public AssetPositionRecord(AssetPosition assetPos) {
        this.imcId = assetPos.getImcId();
        this.timestamp = assetPos.getTimestamp();
        this.lat = assetPos.getLat();
        this.lon = assetPos.getLon();
        this.name = assetPos.getName();
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
}
