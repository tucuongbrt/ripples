package pt.lsts.ripples.domain.shared;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.eclipsesource.json.JsonObject;

@Entity
public class Domain {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ElementCollection
    private List<String> layers = new ArrayList<String>();

    public Domain() {
    }

    public Domain(String name) {
        this.name = name;
    }

    public String toString() {
        JsonObject json = new JsonObject();
        json.add("id", id);
        json.add("name", name);
        json.add("layers", layers.toString());
        return json.toString();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getLayers() {
        return layers;
    }

    public void setLayer(String layers) {
        this.layers.add(layers);
    }

}
