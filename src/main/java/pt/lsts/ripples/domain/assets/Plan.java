package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
public class Plan implements Serializable {
    @Id
    private String id;

    @OneToMany
    private List<Waypoint> waypoints = new ArrayList<>();

    public Plan() {
        this.id = "idle";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Waypoint> getWaypoints() {
        synchronized (waypoints) {
            return Collections.unmodifiableList(waypoints);
        }
    }

    public void setWaypoints(List<Waypoint> waypoints) {
        synchronized (waypoints) {
            waypoints.clear();
            waypoints.addAll(waypoints);
        }
    }

}
