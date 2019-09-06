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
	private Map<String,Double> currentDirection;

	@ElementCollection
	private Map<String,Double> currentSpeed;

	@ElementCollection
	private Map<String,Double> gust;

	@ElementCollection
	private Map<String,Double> waterTemperature;

	@ElementCollection
	private Map<String,Double> waveDirection;

	@ElementCollection
	private Map<String,Double> waveHeight;

	@ElementCollection
	private Map<String,Double> windDirection;

	@ElementCollection
	private Map<String,Double> windSpeed;

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
				case "currentDirection":
				this.setCurrentDirection(paramValue);
				break;
				case "currentSpeed":
				this.setCurrentSpeed(paramValue);
				break;
				case "gust":
				this.setGust(paramValue);
				break;
				case "waterTemperature":
				this.setWaterTemperature(paramValue);
				break;
				case "waveDirection":
				this.setWaveDirection(paramValue);
				break;
				case "waveHeight":
				this.setWaveHeight(paramValue);
				break;
				case "windDirection":
				this.setWindDirection(paramValue);
				break;
				case "windSpeed":
				this.setWindSpeed(paramValue);
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

	public Map<String,Double> getCurrentDirection() {
		return currentDirection;
	}

	public void setCurrentDirection(JSONArray currentDirection) {
		this.currentDirection = this.mapFromJsonArray(currentDirection);
	}

	public Map<String,Double> getCurrentSpeed() {
		return currentSpeed;
	}

	public void setCurrentSpeed(JSONArray currentSpeed) {
		this.currentSpeed = this.mapFromJsonArray(currentSpeed);
	}

	public Map<String,Double> getGust() {
		return gust;
	}

	public void setGust(JSONArray gust) {
		this.gust = this.mapFromJsonArray(gust);
	}

	public Map<String,Double> getWaterTemperature() {
		return waterTemperature;
	}

	public void setWaterTemperature(JSONArray waterTemperature) {
		this.waterTemperature = this.mapFromJsonArray(waterTemperature);
	}

	public Map<String,Double> getWaveDirection() {
		return waveDirection;
	}

	public void setWaveDirection(JSONArray waveDirection) {
		this.waveDirection = this.mapFromJsonArray(waveDirection);
	}

	public Map<String,Double> getWaveHeight() {
		return waveHeight;
	}

	public void setWaveHeight(JSONArray waveHeight) {
		this.waveHeight = this.mapFromJsonArray(waveHeight);
	}

	public Map<String,Double> getWindDirection() {
		return windDirection;
	}

	public void setWindDirection(JSONArray windDirection) {
		this.windDirection = this.mapFromJsonArray(windDirection);
	}

	public Map<String,Double> getWindSpeed() {
		return windSpeed;
	}

	public void setWindSpeed(JSONArray windSpeed) {
		this.windSpeed = this.mapFromJsonArray(windSpeed);
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