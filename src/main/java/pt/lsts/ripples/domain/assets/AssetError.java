package pt.lsts.ripples.domain.assets;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class AssetError {
    @Id
    @GeneratedValue
    Long id;

    Long timestamp;

    String message;

    public AssetError(String message) {
        this.timestamp = new Date().getTime();
        this.message = message;
    }

    public AssetError() {
        this.timestamp = new Date().getTime();
        this.message = "";
    }

    public Long getTimestamp() {
        return this.timestamp;
    }

    public String getMessage() {
        return this.message;
    }
}