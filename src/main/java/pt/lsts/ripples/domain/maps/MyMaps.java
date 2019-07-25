package pt.lsts.ripples.domain.maps;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class MyMaps {

	@Id
	private String name;

	private String url;

	private String data;

	private Date lastUpdate;

	public MyMaps() {

	}

	public MyMaps(String name, String url) {
		this.name = name;
		this.url = url;
		lastUpdate = new Date(0);
	}

	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

}