package pt.lsts.wg.wgviewer.domain;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class AISDatum {
	
	@Id
	private long uid; //MMSI
	
	private String source,type,flag;
	
	private Date timestamp;
	

	/**
	 * @return the uid
	 */
	public long getUid() {
		return uid;
	}

	/**
	 * @param uid the uid to set
	 */
	public void setUid(long uid) {
		this.uid = uid;
	}

	/**
	 * @return the source
	 */
	public String getSource() {
		return source;
	}

	/**
	 * @param source the source to set
	 */
	public void setSource(String source) {
		this.source = source;
	}

	/**
	 * @return the timestamp
	 */
	public Date getTimestamp() {
		return timestamp;
	}

	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the flag
	 */
	public String getFlag() {
		return flag;
	}

	/**
	 * @param flag the flag to set
	 */
	public void setFlag(String flag) {
		this.flag = flag;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	public static AISDatum getDefault(long mmsi) {
		String aux  = "mmsi_";
		String _mmsi = Long.toString(mmsi);
		AISDatum ais = new AISDatum();
		ais.setFlag("");
		ais.setUid(mmsi);
		ais.setSource(aux+_mmsi);
		ais.setType("unknown");
		return ais;
	}

	
}
