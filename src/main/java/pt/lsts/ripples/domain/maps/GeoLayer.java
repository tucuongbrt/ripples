package pt.lsts.ripples.domain.maps;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class GeoLayer {
	@Id
	String name;

	private String layerGroup;

	private String layerName;

	public GeoLayer() {
	}

	public GeoLayer(String layerGroup, String layerName) {
		setName(layerGroup + ":" + layerName);
		setLayerGroup(layerGroup);
		setLayerName(layerName);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLayerGroup() {
		return layerGroup;
	}

	public void setLayerGroup(String layerGroup) {
		this.layerGroup = layerGroup;
	}

	public String getLayerName() {
		return layerName;
	}

	public void setLayerName(String layerName) {
		this.layerName = layerName;
	}
}