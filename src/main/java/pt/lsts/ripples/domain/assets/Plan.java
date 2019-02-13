package pt.lsts.ripples.domain.assets;

import java.io.Serializable;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Vector;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;

import pt.lsts.imc.SoiPlan;
import pt.lsts.imc.SoiWaypoint;
import pt.lsts.ripples.util.CRC16Util;

@Entity
public class Plan implements Serializable {

	private static final long serialVersionUID = -9138676928142387564L;

	
	@Id
	private Long uid;	
	
    private String id;

    @ElementCollection
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
