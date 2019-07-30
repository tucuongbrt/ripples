package pt.lsts.ripples.domain.logbook;

public class NewAnnotation {
	private String content;

	private double latitude;

	private double longitude;

	public NewAnnotation(String content, double latitude, double longitude) {
		this.setContent(content);
		this.setLatitude(latitude);
		this.setLongitude(longitude);
	}

	public double getLongitude() {
		return longitude;
	}

	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	public double getLatitude() {
		return latitude;
	}

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

}