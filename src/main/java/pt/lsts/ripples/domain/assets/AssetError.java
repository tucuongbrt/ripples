package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class AssetError {

    
    @Id
    @GeneratedValue
    private Long id;

    // Asset name
    private String name;
    
    // The error message
    private String error;

    public AssetError(String name, String error) {
        this.name = name;
        this.error = error;
    }

    public AssetError() {
        this.name = "";
        this.error = "";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

}
