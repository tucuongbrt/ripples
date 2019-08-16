package pt.lsts.ripples.domain.assets;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class UserLocation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String email;

	private String name;

	private double latitude;

	private double longitude;

	private double accuracy;

	private Date timestamp;

	public UserLocation() { }

	public UserLocation(String email, String name, double latitude, double longitude, double accuracy, Date timestamp) {
		this.setEmail(email);
		this.setName(name);
		this.setLatitude(latitude);
		this.setLongitude(longitude);
		this.setAccuracy(accuracy);
		this.setTimestamp(timestamp);
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