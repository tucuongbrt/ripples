package pt.lsts.ripples.domain.wg;

public class WGCtd {
	private String kind, undefined, wasEncripted, sensorIdentifier;
	private long vid;
	private double latitude, longitude;
	private long time, acessionTime;
	private double conductivity, dissolvedOxygen, oxygenHz, oxygenSolubility, pressure, salinity, temperature;
	
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
	public String getWasEncripted() {
		return wasEncripted;
	}
	/**
	 * @param wasEncripted the wasEncripted to set
	 */
	public void setWasEncripted(String wasEncripted) {
		this.wasEncripted = wasEncripted;
	}
	/**
	 * @return the sensorIdentifier
	 */
	public String getSensorIdentifier() {
		return sensorIdentifier;
	}
	/**
	 * @param sensorIdentifier the sensorIdentifier to set
	 */
	public void setSensorIdentifier(String sensorIdentifier) {
		this.sensorIdentifier = sensorIdentifier;
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
	 * @return the conductivity
	 */
	public double getConductivity() {
		return conductivity;
	}
	/**
	 * @param conductivity the conductivity to set
	 */
	public void setConductivity(double conductivity) {
		this.conductivity = conductivity;
	}
	/**
	 * @return the dissolvedOxygen
	 */
	public double getDissolvedOxygen() {
		return dissolvedOxygen;
	}
	/**
	 * @param dissolvedOxygen the dissolvedOxygen to set
	 */
	public void setDissolvedOxygen(double dissolvedOxygen) {
		this.dissolvedOxygen = dissolvedOxygen;
	}
	/**
	 * @return the oxygenHz
	 */
	public double getOxygenHz() {
		return oxygenHz;
	}
	/**
	 * @param oxygenHz the oxygenHz to set
	 */
	public void setOxygenHz(double oxygenHz) {
		this.oxygenHz = oxygenHz;
	}
	/**
	 * @return the oxygenSolubility
	 */
	public double getOxygenSolubility() {
		return oxygenSolubility;
	}
	/**
	 * @param oxygenSolubility the oxygenSolubility to set
	 */
	public void setOxygenSolubility(double oxygenSolubility) {
		this.oxygenSolubility = oxygenSolubility;
	}
	/**
	 * @return the pressure
	 */
	public double getPressure() {
		return pressure;
	}
	/**
	 * @param pressure the pressure to set
	 */
	public void setPressure(double pressure) {
		this.pressure = pressure;
	}
	/**
	 * @return the salinity
	 */
	public double getSalinity() {
		return salinity;
	}
	/**
	 * @param salinity the salinity to set
	 */
	public void setSalinity(double salinity) {
		this.salinity = salinity;
	}
	/**
	 * @return the temperature
	 */
	public double getTemperature() {
		return temperature;
	}
	/**
	 * @param temperature the temperature to set
	 */
	public void setTemperature(double temperature) {
		this.temperature = temperature;
	}
}