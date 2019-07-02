package pt.lsts.ripples.domain.assets;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class AssetErrors {

    // Asset name
    @Id
    private String name;
    
    // The error messages
    @ElementCollection
    @OneToMany(cascade=CascadeType.ALL)
    private Set<AssetError> errors;

    public AssetErrors(String name, String error) {
        this.errors = new HashSet<>();
        this.name = name;
        this.errors.add(new AssetError(error));
    }

    public AssetErrors(String name) {
        this.errors = new HashSet<>();
        this.name = name;
    }

    public AssetErrors() {
        this.name = "";
        this.errors = new HashSet<>();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<AssetError> getErrors() {
        return errors;
    }

    public void addError(String error) {
        this.errors.add(new AssetError(error));
    }

}
