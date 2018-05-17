package pt.lsts.ripples.domain.soi;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;

import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;

import pt.lsts.imc.SoiPlan;
import pt.lsts.imc.SoiWaypoint;
import pt.lsts.imc.StateReport;
import pt.lsts.ripples.domain.soi.VerticalProfileData.Sample;

@Entity
public class SoiState {

	@Id
	public String vehicle;
	
	public String planId = null;
	
	public Date plan_updated;
	public Date state_updated;

	public Double latitude, longitude, fuel, heading;

	@ElementCollection(fetch = FetchType.EAGER)
	List<Double[]> plan = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	Map<String, String> settings = new LinkedHashMap<>();

	public void setReport(StateReport report) {
		this.vehicle = report.getSourceName();
		this.latitude = report.getLatitude();
		this.longitude = report.getLongitude();
		this.fuel = report.getFuel() / 255.0;
		this.heading = (report.getHeading() / 65535.0) * 360;
		this.state_updated = report.getDate();
	}

	public void setPlan(SoiPlan plan) {
		this.plan_updated = plan.getDate();
		this.plan = new ArrayList<>();
		this.planId = "soi_"+plan.getPlanId();
		if (plan == null || plan.getWaypoints().isEmpty())
			return;
		else {
			for (SoiWaypoint wpt : plan.getWaypoints()) {
				this.plan.add(
						new Double[] { wpt.getLat(), wpt.getLon(), wpt.getEta() / 1000.0, (double) wpt.getDuration() });
			}
		}
	}
	
	public void setSettings(Map<String, String> settings) {
		this.settings.clear();
		this.settings.putAll(settings);
	}
}
