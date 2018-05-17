package pt.lsts.ripples.domain.wg;

public class WGPosition {
	private String kind, undefined;
	private long vid;
	private double latitude, longitude,currentBearing,currentSpeed,distanceOverGround,headingDesired,headingSkew,headingSub,pressureSensorSub,
	speedToGoal,tempSub,waterSpeed;
	private long time, acessionTime;
	private int targetWaypoint,totalPower;
	private boolean floatBatteryLowAlarm,floatLeakAlarm,floatPressureThresholdExceededAlarm,floatRebootAlarm,floatTempThresholdExceededAlarm,
	floatToSubCommsAlarm,gpsNotFunctioningAlarm,internalVehicleCommAlarm,overCurrentAlarm,payloadErrorConditionAlarm,subTempThresholdExceededAlarm,
	subRebootAlarm,subPressureThresholdAlarm,subToFloatCommsAlarm,umbilicalFaultAlarm,subLeakAlarm,wasEncripted;
	
	/**
	 * @return the kind
	 */
	public String getKind() {
		return kind;
	}
	/**
	 * @param kind the kind to set
	 */
	public void setKind(String kind) {
		this.kind = kind;
	}
	/**
	 * @return the undefined
	 */
	public String getUndefined() {
		return undefined;
	}
	/**
	 * @param undefined the undefined to set
	 */
	public void setUndefined(String undefined) {
		this.undefined = undefined;
	}
	/**
	 * @return the wasEncripted
	 */
	public boolean getWasEncripted() {
		return wasEncripted;
	}
	/**
	 * @param wasEncripted the wasEncripted to set
	 */
	public void setWasEncripted(boolean wasEncripted) {
		this.wasEncripted = wasEncripted;
	}
	/**
	 * @return the vid
	 */
	public long getVid() {
		return vid;
	}
	/**
	 * @param vid the vid to set
	 */
	public void setVid(long vid) {
		this.vid = vid;
	}
	/**
	 * @return the latitude
	 */
	public double getLatitude() {
		return latitude;
	}
	/**
	 * @param latitude the latitude to set
	 */
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}
	/**
	 * @return the longitude
	 */
	public double getLongitude() {
		return longitude;
	}
	/**
	 * @param longitude the longitude to set
	 */
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	/**
	 * @return the time
	 */
	public long getTime() {
		return time;
	}
	/**
	 * @param time the time to set
	 */
	public void setTime(long time) {
		this.time = time;
	}
	/**
	 * @return the acessionTime
	 */
	public long getAcessionTime() {
		return acessionTime;
	}
	/**
	 * @param acessionTime the acessionTime to set
	 */
	public void setAcessionTime(long acessionTime) {
		this.acessionTime = acessionTime;
	}
	/**
	 * @return the currentBearing
	 */
	public double getCurrentBearing() {
		return currentBearing;
	}
	/**
	 * @param currentBearing the currentBearing to set
	 */
	public void setCurrentBearing(double currentBearing) {
		this.currentBearing = currentBearing;
	}
	/**
	 * @return the currentSpeed
	 */
	public double getCurrentSpeed() {
		return currentSpeed;
	}
	/**
	 * @param currentSpeed the currentSpeed to set
	 */
	public void setCurrentSpeed(double currentSpeed) {
		this.currentSpeed = currentSpeed;
	}
	/**
	 * @return the distanceOverGround
	 */
	public double getDistanceOverGround() {
		return distanceOverGround;
	}
	/**
	 * @param distanceOverGround the distanceOverGround to set
	 */
	public void setDistanceOverGround(double distanceOverGround) {
		this.distanceOverGround = distanceOverGround;
	}
	/**
	 * @return the headingDesired
	 */
	public double getHeadingDesired() {
		return headingDesired;
	}
	/**
	 * @param headingDesired the headingDesired to set
	 */
	public void setHeadingDesired(double headingDesired) {
		this.headingDesired = headingDesired;
	}
	/**
	 * @return the headingSkew
	 */
	public double getHeadingSkew() {
		return headingSkew;
	}
	/**
	 * @param headingSkew the headingSkew to set
	 */
	public void setHeadingSkew(double headingSkew) {
		this.headingSkew = headingSkew;
	}
	/**
	 * @return the headingSub
	 */
	public double getHeadingSub() {
		return headingSub;
	}
	/**
	 * @param headingSub the headingSub to set
	 */
	public void setHeadingSub(double headingSub) {
		this.headingSub = headingSub;
	}
	/**
	 * @return the pressureSensorSub
	 */
	public double getPressureSensorSub() {
		return pressureSensorSub;
	}
	/**
	 * @param pressureSensorSub the pressureSensorSub to set
	 */
	public void setPressureSensorSub(double pressureSensorSub) {
		this.pressureSensorSub = pressureSensorSub;
	}
	/**
	 * @return the speedToGoal
	 */
	public double getSpeedToGoal() {
		return speedToGoal;
	}
	/**
	 * @param speedToGoal the speedToGoal to set
	 */
	public void setSpeedToGoal(double speedToGoal) {
		this.speedToGoal = speedToGoal;
	}
	/**
	 * @return the subLeakAlarm
	 */
	public boolean getSubLeakAlarm() {
		return subLeakAlarm;
	}
	/**
	 * @param subLeakAlarm the subLeakAlarm to set
	 */
	public void setSubLeakAlarm(boolean subLeakAlarm) {
		this.subLeakAlarm = subLeakAlarm;
	}
	/**
	 * @return the tempSub
	 */
	public double getTempSub() {
		return tempSub;
	}
	/**
	 * @param tempSub the tempSub to set
	 */
	public void setTempSub(double tempSub) {
		this.tempSub = tempSub;
	}
	/**
	 * @return the waterSpeed
	 */
	public double getWaterSpeed() {
		return waterSpeed;
	}
	/**
	 * @param waterSpeed the waterSpeed to set
	 */
	public void setWaterSpeed(double waterSpeed) {
		this.waterSpeed = waterSpeed;
	}
	/**
	 * @return the targetWaypoint
	 */
	public int getTargetWaypoint() {
		return targetWaypoint;
	}
	/**
	 * @param targetWaypoint the targetWaypoint to set
	 */
	public void setTargetWaypoint(int targetWaypoint) {
		this.targetWaypoint = targetWaypoint;
	}
	/**
	 * @return the totalPower
	 */
	public int getTotalPower() {
		return totalPower;
	}
	/**
	 * @param totalPower the totalPower to set
	 */
	public void setTotalPower(int totalPower) {
		this.totalPower = totalPower;
	}
	/**
	 * @return the floatBatteryLowAlarm
	 */
	public boolean isFloatBatteryLowAlarm() {
		return floatBatteryLowAlarm;
	}
	/**
	 * @param floatBatteryLowAlarm the floatBatteryLowAlarm to set
	 */
	public void setFloatBatteryLowAlarm(boolean floatBatteryLowAlarm) {
		this.floatBatteryLowAlarm = floatBatteryLowAlarm;
	}
	/**
	 * @return the floatLeakAlarm
	 */
	public boolean isFloatLeakAlarm() {
		return floatLeakAlarm;
	}
	/**
	 * @param floatLeakAlarm the floatLeakAlarm to set
	 */
	public void setFloatLeakAlarm(boolean floatLeakAlarm) {
		this.floatLeakAlarm = floatLeakAlarm;
	}
	/**
	 * @return the floatPressureThresholdExceededAlarm
	 */
	public boolean isFloatPressureThresholdExceededAlarm() {
		return floatPressureThresholdExceededAlarm;
	}
	/**
	 * @param floatPressureThresholdExceededAlarm the floatPressureThresholdExceededAlarm to set
	 */
	public void setFloatPressureThresholdExceededAlarm(boolean floatPressureThresholdExceededAlarm) {
		this.floatPressureThresholdExceededAlarm = floatPressureThresholdExceededAlarm;
	}
	/**
	 * @return the floatRebootAlarm
	 */
	public boolean isFloatRebootAlarm() {
		return floatRebootAlarm;
	}
	/**
	 * @param floatRebootAlarm the floatRebootAlarm to set
	 */
	public void setFloatRebootAlarm(boolean floatRebootAlarm) {
		this.floatRebootAlarm = floatRebootAlarm;
	}
	/**
	 * @return the floatTempThresholdExceededAlarm
	 */
	public boolean isFloatTempThresholdExceededAlarm() {
		return floatTempThresholdExceededAlarm;
	}
	/**
	 * @param floatTempThresholdExceededAlarm the floatTempThresholdExceededAlarm to set
	 */
	public void setFloatTempThresholdExceededAlarm(boolean floatTempThresholdExceededAlarm) {
		this.floatTempThresholdExceededAlarm = floatTempThresholdExceededAlarm;
	}
	/**
	 * @return the floatToSubCommsAlarm
	 */
	public boolean isFloatToSubCommsAlarm() {
		return floatToSubCommsAlarm;
	}
	/**
	 * @param floatToSubCommsAlarm the floatToSubCommsAlarm to set
	 */
	public void setFloatToSubCommsAlarm(boolean floatToSubCommsAlarm) {
		this.floatToSubCommsAlarm = floatToSubCommsAlarm;
	}
	/**
	 * @return the gpsNotFunctioningAlarm
	 */
	public boolean isGpsNotFunctioningAlarm() {
		return gpsNotFunctioningAlarm;
	}
	/**
	 * @param gpsNotFunctioningAlarm the gpsNotFunctioningAlarm to set
	 */
	public void setGpsNotFunctioningAlarm(boolean gpsNotFunctioningAlarm) {
		this.gpsNotFunctioningAlarm = gpsNotFunctioningAlarm;
	}
	/**
	 * @return the internalVehicleCommAlarm
	 */
	public boolean isInternalVehicleCommAlarm() {
		return internalVehicleCommAlarm;
	}
	/**
	 * @param internalVehicleCommAlarm the internalVehicleCommAlarm to set
	 */
	public void setInternalVehicleCommAlarm(boolean internalVehicleCommAlarm) {
		this.internalVehicleCommAlarm = internalVehicleCommAlarm;
	}
	/**
	 * @return the overCurrentAlarm
	 */
	public boolean isOverCurrentAlarm() {
		return overCurrentAlarm;
	}
	/**
	 * @param overCurrentAlarm the overCurrentAlarm to set
	 */
	public void setOverCurrentAlarm(boolean overCurrentAlarm) {
		this.overCurrentAlarm = overCurrentAlarm;
	}
	/**
	 * @return the payloadErrorConditionAlarm
	 */
	public boolean isPayloadErrorConditionAlarm() {
		return payloadErrorConditionAlarm;
	}
	/**
	 * @param payloadErrorConditionAlarm the payloadErrorConditionAlarm to set
	 */
	public void setPayloadErrorConditionAlarm(boolean payloadErrorConditionAlarm) {
		this.payloadErrorConditionAlarm = payloadErrorConditionAlarm;
	}
	/**
	 * @return the subTempThresholdExceededAlarm
	 */
	public boolean isSubTempThresholdExceededAlarm() {
		return subTempThresholdExceededAlarm;
	}
	/**
	 * @param subTempThresholdExceededAlarm the subTempThresholdExceededAlarm to set
	 */
	public void setSubTempThresholdExceededAlarm(boolean subTempThresholdExceededAlarm) {
		this.subTempThresholdExceededAlarm = subTempThresholdExceededAlarm;
	}
	/**
	 * @return the subRebootAlarm
	 */
	public boolean isSubRebootAlarm() {
		return subRebootAlarm;
	}
	/**
	 * @param subRebootAlarm the subRebootAlarm to set
	 */
	public void setSubRebootAlarm(boolean subRebootAlarm) {
		this.subRebootAlarm = subRebootAlarm;
	}
	/**
	 * @return the subPressureThresholdAlarm
	 */
	public boolean isSubPressureThresholdAlarm() {
		return subPressureThresholdAlarm;
	}
	/**
	 * @param subPressureThresholdAlarm the subPressureThresholdAlarm to set
	 */
	public void setSubPressureThresholdAlarm(boolean subPressureThresholdAlarm) {
		this.subPressureThresholdAlarm = subPressureThresholdAlarm;
	}
	/**
	 * @return the subToFloatCommsAlarm
	 */
	public boolean isSubToFloatCommsAlarm() {
		return subToFloatCommsAlarm;
	}
	/**
	 * @param subToFloatCommsAlarm the subToFloatCommsAlarm to set
	 */
	public void setSubToFloatCommsAlarm(boolean subToFloatCommsAlarm) {
		this.subToFloatCommsAlarm = subToFloatCommsAlarm;
	}
	/**
	 * @return the umbilicalFaultAlarm
	 */
	public boolean isUmbilicalFaultAlarm() {
		return umbilicalFaultAlarm;
	}
	/**
	 * @param umbilicalFaultAlarm the umbilicalFaultAlarm to set
	 */
	public void setUmbilicalFaultAlarm(boolean umbilicalFaultAlarm) {
		this.umbilicalFaultAlarm = umbilicalFaultAlarm;
	}
}