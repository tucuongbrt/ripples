package pt.lsts.ripples.domain.maps;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class MyMaps {

	@Id
	private String name;

	private String url;

	@JsonIgnore
	@Lob
	private String data;

	@JsonIgnore
	private Date lastUpdate;

	@ElementCollection
    private List<String> domain = new ArrayList<String>();

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

	public List<String> getDomain() {
        return domain;
    }

    public void setDomain(List<String> domain) {
        this.domain = domain;
    }

}