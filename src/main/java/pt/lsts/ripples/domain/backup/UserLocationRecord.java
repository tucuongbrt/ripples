package pt.lsts.ripples.domain.backup;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import pt.lsts.ripples.domain.assets.UserLocation;

@Entity
public class UserLocationRecord extends BackupRecord {
	
	private Integer imcId;

	@Column(nullable = false)
	private String email;

	private String name;

	private double latitude;

	private double longitude;

	private double accuracy;

	private Date timestamp;

	public UserLocationRecord(UserLocation location) {
		this.imcId = location.getImcId();
		this.email = location.getEmail();
		this.name = location.getName();
		this.latitude = location.getLatitude();
		this.longitude = location.getLongitude();
		this.accuracy = location.getAccuracy();
		this.timestamp = location.getTimestamp();
	}

	public Integer getImcId() {
		return imcId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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

	public double getAccuracy() {
		return accuracy;
	}

	public void setAccuracy(double accuracy) {
		this.accuracy = accuracy;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	private void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
}