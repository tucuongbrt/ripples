package pt.lsts.ripples.domain.maps;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class MapSettings {

	@Id
	@GeneratedValue
	private Long id;

	private double lat = 41.18;
	private double lng = -8.7;
	private double zoom = 10;

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLng() {
		return lng;
	}

	public void setLng(double lng) {
		this.lng = lng;
	}

	public double getZoom() {
		return zoom;
	}

	public void setZoom(double zoom) {
		this.zoom = zoom;
	}

	public String toString() {
		return "{ lat: " + lat + ", lng: " + lng + ", zoom: " + zoom + " }";
	}
}