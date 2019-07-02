package pt.lsts.ripples.domain.assets;

import pt.lsts.imc.SoiPlan;
import pt.lsts.imc.SoiWaypoint;
import pt.lsts.ripples.util.CRC16Util;

import javax.persistence.*;
import java.io.Serializable;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Vector;

@Entity
public class Plan implements Serializable {

	private static final long serialVersionUID = -9138676928142387564L;

	
	@Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
	private Long uid;	
	
    private String id;

    @ElementCollection
    @OneToMany(cascade = {CascadeType.ALL})
    private List<Waypoint> waypoints = new ArrayList<>();

    private String description;

    public Plan() {
        this.id = "idle";
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        synchronized (this.waypoints) {
            this.waypoints.clear();
            this.waypoints.addAll(waypoints);
        }
    }
    
    public SoiPlan asImc() {
        SoiPlan plan = new SoiPlan();
        if (waypoints != null) {
            Vector<SoiWaypoint> wps = new Vector<>(waypoints.size());
            for (Waypoint wpt : waypoints) {
                SoiWaypoint waypoint = new SoiWaypoint();
                waypoint.setEta(wpt.getEta());
                waypoint.setLat(wpt.getLatitude());
                waypoint.setLon(wpt.getLongitude());
                waypoint.setDuration(wpt.getDuration());

                wps.add(waypoint);
            }
            plan.setWaypoints(wps);
        }

        ByteBuffer destination = ByteBuffer.allocate(plan.getPayloadSize());
        int dataLength = plan.serializePayload(destination, 0);
        plan.setPlanId(CRC16Util.crc16(destination, 2, dataLength - 2));
        return plan;
    }

}
