package pt.lsts.ripples.domain.wg;

public class WGAIS {
	private String kind, undefined,aistype;
	private long vid;
	private double latitude, longitude;
	private long time, acessionTime,MMSI;
	private double COG,SOG,ROT,heading;
	private int packetSource,navigationStatus;
	private boolean wasEncripted;
	
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
	 * @return the sensorIdentifier
	 */
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
		return this.longitude;
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
		return this.time;
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
		return this.acessionTime;
	}
	/**
	 * @param acessionTime the acessionTime to set
	 */
	public void setAcessionTime(long acessionTime) {
		this.acessionTime = acessionTime;
	}
	/**
	 * @return the aistype
	 */
	public String getAistype() {
		return this.aistype;
	}
	/**
	 * @param aistype the aistype to set
	 */
	public void setAistype(String aistype) {
		this.aistype = aistype;
	}
	/**
	 * @return the mMSI
	 */
	public long getMMSI() {
		return this.MMSI;
	}
	/**
	 * @param mMSI the mMSI to set
	 */
	public void setMMSI(long mMSI) {
		this.MMSI = mMSI;
	}
	/**
	 * @return the sOG
	 */
	public double getSOG() {
		return this.SOG;
	}
	/**
	 * @param sOG the sOG to set
	 */
	public void setSOG(double sOG) {
		this.SOG = sOG;
	}
	/**
	 * @return the rOT
	 */
	public double getROT() {
		return this.ROT;
	}
	/**
	 * @param rOT the rOT to set
	 */
	public void setROT(double rOT) {
		this.ROT = rOT;
	}
	/**
	 * @return the heading
	 */
	public double getHeading() {
		return this.heading;
	}
	/**
	 * @param heading the heading to set
	 */
	public void setHeading(double heading) {
		this.heading = heading;
	}
	/**
	 * @return the packetSource
	 */
	public int getPacketSource() {
		return this.packetSource;
	}
	/**
	 * @param packetSource the packetSource to set
	 */
	public void setPacketSource(int packetSource) {
		this.packetSource = packetSource;
	}
	/**
	 * @return the navigationStatus
	 */
	public int getNavigationStatus() {
		return this.navigationStatus;
	}
	/**
	 * @param navigationStatus the navigationStatus to set
	 */
	public void setNavigationStatus(int navigationStatus) {
		this.navigationStatus = navigationStatus;
	}
	/**
	 * @return the cOG
	 */
	public double getCOG() {
		return this.COG;
	}
	/**
	 * @param cOG the cOG to set
	 */
	public void setCOG(double cOG) {
		this.COG = cOG;
	}
	/**
	 * @param wasEncripted the wasEncripted to set
	 */
	public void setWasEncripted(boolean wasEncripted) {
		this.wasEncripted = wasEncripted;
	}
}