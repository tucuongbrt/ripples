package pt.lsts.ripples.domain.soi;

import pt.lsts.ripples.domain.assets.Plan;

public class NewPlanBody {

	private String vehicleName;
	
	private Plan plan;

	public String getVehicleName() {
		return vehicleName;
	}

	public void setVehicleName(String vehicleName) {
		this.vehicleName = vehicleName;
	}

	public Plan getPlan() {
		return plan;
	}

	public void setPlan(Plan plan) {
		this.plan = plan;
	}

}
