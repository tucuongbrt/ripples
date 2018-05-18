package pt.lsts.ripples.domain.assets;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;

@Entity
public class AssetInfo {

	@Id
	private String name;

	private double latitude, longitude;

	private Date updated_at = new Date(0);

	private String moreInfoUrl = null;
	private String icon = null;

	@ElementCollection(fetch = FetchType.EAGER)
	private Map<String, String> measurements = new LinkedHashMap<>();

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the latitude
	 */
	public double getLatitude() {
		return latitude;
	}

	/**
	 * @param latitude
	 *            the latitude to set
	 */
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	/**
	 * @return the longitude
	 */
	public double getLongitude() {
		return longitude;
	}

	/**
	 * @param longitude
	 *            the longitude to set
	 */
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	/**
	 * @return the updated_at
	 */
	public Date getUpdated_at() {
		return updated_at;
	}

	/**
	 * @param updated_at
	 *            the updated_at to set
	 */
	public void setUpdated_at(Date updated_at) {
		this.updated_at = updated_at;
	}

	/**
	 * @return the moreInfoUrl
	 */
	public String getMoreInfoUrl() {
		return moreInfoUrl;
	}

	/**
	 * @param moreInfoUrl
	 *            the moreInfoUrl to set
	 */
	public void setMoreInfoUrl(String moreInfoUrl) {
		this.moreInfoUrl = moreInfoUrl;
	}

	/**
	 * @return the measurements
	 */
	public Map<String, String> getMeasurements() {
		return measurements;
	}

	/**
	 * @param measurements
	 *            the measurements to set
	 */
	public void setMeasurements(Map<String, String> measurements) {
		this.measurements = measurements;
	}

	/**
	 * @return the icon
	 */
	public String getIcon() {
		return icon;
	}

	/**
	 * @param icon
	 *            the icon to set
	 */
	public void setIcon(String icon) {
		this.icon = icon;
	}
}
