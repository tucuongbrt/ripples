package pt.lsts.ripples.domain.soi;

import java.util.ArrayList;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;

import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;

@Entity

public class VerticalProfileData {

	@Id
	private Long uid;

	private String system;

	public String sample_type = "Temperature";

	public Date timestamp = new Date();

	public double latitude = 0d;
	public double longitude = 0d;

	public ArrayList<Sample> samples = new ArrayList<Sample>();

	public static class Sample {
		double depth = -1;
		double value = 0;

		public Sample() {

		}

		public Sample(double depth, double value) {
			this.depth = depth;
			this.value = value;
		}
	}

	@Override
	public String toString() {
		JsonObject json = new JsonObject();

		json.add("timestamp", "" + timestamp.getTime() / 1000);
		if (system != null)
			json.add("source", system);

		json.add("type", sample_type);
		json.add("latitude", "" + latitude);
		json.add("longitude", "" + longitude);

		JsonArray array = new JsonArray();
		for (Sample s : samples) {
			JsonObject elem = new JsonObject();
			elem.add("depth", s.depth);
			elem.add("value", s.value);
			array.add(elem);
		}
		json.add("samples", array);

		return json.toString();
	}
}
