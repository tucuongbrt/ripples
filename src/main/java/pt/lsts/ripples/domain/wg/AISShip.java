package pt.lsts.ripples.domain.wg;

import java.util.Date;

import java.text.ParseException;
import java.text.SimpleDateFormat;

import javax.persistence.Entity;
import javax.persistence.Id;

import com.eclipsesource.json.JsonObject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class AISShip {

	private static final SimpleDateFormat sdf = new SimpleDateFormat("\"yyyy-MM-dd HH:mm:ss Z\"");

	@Id
	private int mmsi;

	private String type;
	private String name;
	private Date timestamp;
	private double cog;
	private double heading;
	private double latitude;
	private double longitude;
	private double sog;
	private double bow; // distance to bow (meters)
	private double stern; // distance to stern (meters)
	private double port; // distance to port (meters)
	private double starboard; // distance to startboard (meters)
	private double draught;
	private String dest; // vessel's destination
	private String eta; // estimated time of arrival

	public static AISShip getDefault(int mmsi) {
		AISShip ais = new AISShip();
		ais.setMmsi(mmsi);
		ais.setCog(0);
		ais.setHeading(0);
		ais.setLatitudeDegs(0);
		ais.setLongitudeDegs(0);
		ais.setName("unknown");
		ais.setSog(0);
		ais.setType("0");
		ais.setTimestamp(new Date());
		ais.setBow(0);
		ais.setStern(0);
		ais.setPort(0);
		ais.setStarboard(0);
		ais.setDraught(0);
		ais.setDest("");
		ais.setEta("");
		return ais;
	}

	public static AISShip parseCSV(String csvString) throws ParseException {
		AISShip ais = new AISShip();
		String[] parts = csvString.split(",");
		ais.mmsi = Integer.valueOf(parts[0]);
		ais.timestamp = new Date(sdf.parse(parts[1]).getTime());
		ais.latitude = Double.valueOf(parts[2]);
		ais.longitude = Double.valueOf(parts[3]);
		ais.cog = Double.valueOf(parts[4]);
		ais.sog = Double.valueOf(parts[5]);
		ais.heading = Double.valueOf(parts[6]);
		ais.name = parts[9].replaceAll("\"", "").replaceAll("\\.", "");
		ais.type = parts[11];
		ais.bow = Double.valueOf(parts[12]);
		ais.stern = Double.valueOf(parts[13]);
		ais.port = Double.valueOf(parts[14]);
		ais.starboard = Double.valueOf(parts[15]);
		ais.draught = Double.valueOf(parts[16]);
		ais.dest = parts[17];
		ais.eta = parts[18];
		return ais;
	}

	@Override
	public String toString() {
		JsonObject json = new JsonObject();
		json.add("mmsi", mmsi);
		json.add("name", name);
		json.add("timestamp", "" + timestamp.getTime());
		json.add("type", type);
		json.add("latitude", "" + latitude);
		json.add("longitude", "" + longitude);
		json.add("cog", "" + cog);
		json.add("sog", "" + sog);
		json.add("heading", "" + heading);
		json.add("bow", "" + bow);
		json.add("stern", "" + stern);
		json.add("port", "" + port);
		json.add("starboard", "" + starboard);
		json.add("draught", "" + draught);
		json.add("dest", "" + dest);
		json.add("eta", eta + " UTC");
		return json.toString();
	}

	public int getMmsi() {
		return mmsi;
	}

	public void setMmsi(int mmsi) {
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

	@JsonIgnore
	public double getLatitudeRads() {
		return latitude * Math.PI / 180;
	}
	
	@JsonProperty("latitude")
	public void setLatitudeDegs(double latitude) {
		this.latitude = latitude;
	}

	@JsonProperty("longitude")
	public double getLongitudeDegs() {
		return longitude;
	}

	@JsonIgnore
	public double getLongitudeRads() {
		return longitude * Math.PI / 180;
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

	public double getStarboard() {
		return starboard;
	}

	public void setStarboard(double startboard) {
		this.starboard = startboard;
	}

	public double getPort() {
		return port;
	}

	public void setPort(double port) {
		this.port = port;
	}

	public double getStern() {
		return stern;
	}

	public void setStern(double stern) {
		this.stern = stern;
	}

	public double getBow() {
		return bow;
	}

	public void setBow(double bow) {
		this.bow = bow;
	}

	public double getDraught() {
		return draught;
	}

	public void setDraught(double draught) {
		this.draught = draught;
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
