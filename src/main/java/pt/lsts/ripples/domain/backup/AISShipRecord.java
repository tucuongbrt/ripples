package pt.lsts.ripples.domain.backup;

import java.util.Date;
import javax.persistence.Entity;

import pt.lsts.ripples.domain.wg.AISShip;

@Entity
public class AISShipRecord extends BackupRecord {

	private int mmsi;
	private int type;
	private String name;
	private Date timestamp;
	private double cog;
	private double heading;
	private double latitude;
	private double longitude;
	private double sog;
	private String dest; // vessel's destination
	private String eta; // estimated time of arrival

	public AISShipRecord(AISShip aisShip) {
		this.mmsi = aisShip.getMmsi();
		this.type = aisShip.getType();
		this.name = aisShip.getName();
		this.timestamp = aisShip.getTimestamp();
		this.cog = aisShip.getCog();
		this.heading = aisShip.getHeading();
		this.latitude = aisShip.getLatitudeDegs();
		this.longitude = aisShip.getLongitudeDegs();
		this.sog = aisShip.getSog();
		this.dest = aisShip.getDest();
		this.eta = aisShip.getEta();
	}

	public int getMmsi() {
		return mmsi;
	}

	public void setMmsi(int mmsi) {
		this.mmsi = mmsi;
	}

	public Integer getType() {
		return type;
	}

	public void setType(Integer type) {
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date updated_at) {
		this.timestamp = updated_at;
	}

	public double getCog() {
		return cog;
	}

	public void setCog(double cog) {
		this.cog = cog;
	}

	public double getHeading() {
		return heading;
	}

	public void setHeading(double heading) {
		this.heading = heading;
	}

	public double getLatitudeDegs() {
		return latitude;
	}

	public void setLatitudeDegs(double latitude) {
		this.latitude = latitude;
	}

	public double getLongitudeDegs() {
		return longitude;
	}

	public void setLongitudeDegs(double longitude) {
		this.longitude = longitude;
	}

	public double getSog() {
		return sog;
	}

	public void setSog(double sog) {
		this.sog = sog;
	}

	public String getDest() {
		return dest;
	}

	public void setDest(String dest) {
		this.dest = dest;
	}

	public String getEta() {
		return eta;
	}

	public void setEta(String string) {
		this.eta = string;
	}
}
