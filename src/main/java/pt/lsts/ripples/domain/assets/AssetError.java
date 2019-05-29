package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class AssetError {

    // Asset name
    @Id
    private String name;
    
    // The error message
    private String error;

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
