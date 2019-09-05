package pt.lsts.ripples.domain.assets;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import org.json.JSONArray;
import org.json.JSONException;

import net.minidev.json.JSONObject;

@Entity
public class WeatherStatus {
	@Id
    @GeneratedValue
    Long id;

	private Date timestamp;

	@ElementCollection
	private Map<String,Double> airTemperature;

	@ElementCollection
	private Map<String,Double> waterTemperature;

	@ElementCollection
	private Map<String,Double> windSpeed;
	
	@ElementCollection
	private Map<String,Double> currentSpeed;

	public WeatherStatus(Date timestamp, JSONObject params) {
		this.setTimestamp(timestamp);
		params.entrySet().parallelStream().forEach(param -> {
			this.setParam(param);
		});
	}

	public void setParam(Entry<String, Object> param) {
		if (param.getKey().equals("time")) {
			return;
		}
		try {	
			JSONArray paramValue = new JSONArray(param.getValue().toString());
			switch(param.getKey()) { 
				case "airTemperature":
				this.setAirTemperature(paramValue);
				break;
				case "waterTemperature":
				this.setWaterTemperature(paramValue);
				break;
				case "windSpeed":
				this.setWindSpeed(paramValue);
				break;
				case "currentSpeed":
				this.setCurrentSpeed(paramValue);
				break;
				default:
				return;
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
	
	public Map<String,Double> getAirTemperature() {
		return airTemperature;
	}

	public void setAirTemperature(JSONArray airTemperature) {
		this.airTemperature = this.mapFromJsonArray(airTemperature);
	}

	public Map<String,Double> getWaterTemperature() {
		return waterTemperature;
	}

	public void setWaterTemperature(JSONArray waterTemperature) {
		this.waterTemperature = this.mapFromJsonArray(waterTemperature);
	}

	public Map<String,Double> getWindSpeed() {
		return windSpeed;
	}

	public void setWindSpeed(JSONArray windSpeed) {
		this.windSpeed = this.mapFromJsonArray(windSpeed);
	}

	public Map<String,Double> getCurrentSpeed() {
		return currentSpeed;
	}

	public void setCurrentSpeed(JSONArray currentSpeed) {
		this.currentSpeed = this.mapFromJsonArray(currentSpeed);
	}

	public Map<String, Double> mapFromJsonArray(JSONArray arr) {
		Map<String, Double> map = new HashMap<>();
		try {
			for (int i = 0; i < arr.length(); i++) {  
				String source = arr.getJSONObject(i).getString("source");
				Double value = arr.getJSONObject(i).getDouble("value");
				map.put(source, value);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return map;
	}
}