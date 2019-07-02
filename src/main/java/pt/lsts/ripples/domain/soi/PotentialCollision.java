package pt.lsts.ripples.domain.soi;

import java.util.Date;
import java.util.Objects;

public class PotentialCollision {
    private String asset;
    private String ship;
    private double distance;
    private Date timestamp;

    public PotentialCollision(String asset, String ship, double distance, Date timestamp) {
        this.asset = asset;
        this.ship = ship;
        this.distance = distance;
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "Potential collision between " + asset + " and " + ship + " at " + timestamp.toString() + ";";
    }

    @Override
    public boolean equals(Object o) { 
  
        if (o == this) { 
            return true; 
        } 
        if (!(o instanceof PotentialCollision)) { 
            return false; 
        } 
        // typecast o to Complex so that we can compare data members  
        PotentialCollision c = (PotentialCollision) o; 
          
       return this.asset.equals(c.getAsset()) && this.ship.equals(c.getShip());
    }

    @Override
    public int hashCode() {
        return Objects.hash(asset+ship);
    }


    /**
     * @return the timestamp
     */
    public Date getTimestamp() {
        return timestamp;
    }

    /**
     * @return the distance
     */
    public double getDistance() {
        return distance;
    }

    /**
     * @return the ship
     */
    public String getShip() {
        return ship;
    }

    /**
     * @return the asset
     */
    public String getAsset() {
        return asset;
    }

    
}