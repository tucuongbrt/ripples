package pt.lsts.ripples.domain.soi;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
public class IncomingMessage {
    
    @Id
    @GeneratedValue
    private long uid;

    @Lob
    private String message;

    private String assetName;

    private long timestampMs;

    public IncomingMessage() {
        this.message = "";
        this.assetName = "";
    }

    /**
     * @return the timestamp in milliseconds
     */
    public long getTimestampMs() {
        return timestampMs;
    }

    /**
     * @param timestampMs the timestampMs to set
     */
    public void setTimestampMs(long timestampMs) {
        this.timestampMs = timestampMs;
    }

    /**
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @return the assetName
     */
    public String getAssetName() {
        return assetName;
    }

    /**
     * @param assetName the assetName to set
     */
    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    /**
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

}

