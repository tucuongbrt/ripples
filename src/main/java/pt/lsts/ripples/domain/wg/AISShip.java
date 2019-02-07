package pt.lsts.ripples.domain.wg;

import java.text.ParseException;
import java.text.SimpleDateFormat;

import javax.persistence.Entity;
import javax.persistence.Id;

import com.eclipsesource.json.JsonObject;

@Entity
public class AISShip {

	private static final SimpleDateFormat sdf = new SimpleDateFormat("\"yyyy-MM-dd HH:mm:ss Z\"");

	@Id
	private long mmsi;

	private String type;
	private String name;
	private long updated_at;
	private double cog;
	private double heading;
	private double latitude;
	private double longitude;
	private double sog;

	public static AISShip getDefault(long mmsi) {
		AISShip ais = new AISShip();
		ais.setMmsi(mmsi);
		ais.setCog(0);
		ais.setHeading(0);
		ais.setLatitude(0);
		ais.setLongitude(0);
		ais.setName("unknown");
		ais.setSog(0);
		ais.setType("0");
		ais.setUpdated_at(0);
		return ais;
	}


	public static AISShip parseCSV(String csvString) throws ParseException {
		AISShip ais = new AISShip();
		String[] parts = csvString.split(",");
		ais.mmsi = Long.valueOf(parts[0]);
		ais.updated_at = sdf.parse(parts[1]).getTime();
		ais.latitude = Double.valueOf(parts[2]);
		ais.longitude = Double.valueOf(parts[3]);
		ais.cog = Double.valueOf(parts[4]);
		ais.sog = Double.valueOf(parts[5]);
		ais.heading = Double.valueOf(parts[6]);
		ais.name = parts[9].replaceAll("\"", "").replaceAll("\\.","");
		ais.type = parts[11];
		return ais;
	}

	@Override
	public String toString() {
		JsonObject json = new JsonObject();
		json.add("mmsi", mmsi);
		json.add("name", name);
		json.add("updated_at", "" + updated_at);
		json.add("type", type);
		json.add("latitude", "" + latitude);
		json.add("longitude", "" + longitude);
		json.add("cog", "" + cog);
		json.add("sog", "" + sog);
		json.add("heading", "" + heading); 	
		return json.toString();
	}

	public long getMmsi() {
		return mmsi;
	}

	public void setMmsi(long mmsi) {
		this.mmsi = mmsi;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getUpdated_at() {
		return updated_at;
	}

	public void setUpdated_at(long updated_at) {
		this.updated_at = updated_at;
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

	public double getSog() {
		return sog;
	}

	public void setSog(double sog) {
		this.sog = sog;
	}

}
