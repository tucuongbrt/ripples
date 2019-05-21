package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class AssetError {

    public AssetError() { }

    public AssetError(String name, String message) {
        this.name = name;
        this.error = message;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Id
    private String name;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    private String error;
}
