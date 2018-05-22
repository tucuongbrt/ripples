package pt.lsts.ripples.domain.soi;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;

import pt.lsts.imc.VerticalProfile;

@Entity

public class VerticalProfileData {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long uid;

	private String system;

	public String type = "Temperature";

	public Date timestamp = new Date();

	public double latitude = 0d;
	public double longitude = 0d;

	@ElementCollection
	public List<Double[]> samples = new ArrayList<Double[]>();

	public VerticalProfileData() {

	}

	public VerticalProfileData(VerticalProfile profile) {
		this();
		system = profile.getSourceName();
		latitude = profile.getLat();
		longitude = profile.getLon();
		type = profile.getParameter().name().toLowerCase();
		timestamp = new Date(profile.getTimestampMillis());
		profile.getSamples().forEach(s -> {
			samples.add(new Double[] { (double) s.getDepth(), s.getAvg() });
		});
	}

	@Override
	public String toString() {
		JsonObject json = new JsonObject();

		json.add("timestamp", "" + timestamp.getTime() / 1000);
		if (system != null)
			json.add("source", system);

		json.add("type", type);
		json.add("latitude", "" + latitude);
		json.add("longitude", "" + longitude);

		JsonArray array = new JsonArray();
		for (Double[] s : samples) {
			JsonObject elem = new JsonObject();
			elem.add("depth", String.format("%.1f", s[0]));
			elem.add("value", String.format("%.3f", s[1]));
			array.add(elem);
		}
		json.add("samples", array);

		return json.toString();
	}
}
