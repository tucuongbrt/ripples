package pt.lsts.ripples.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pt.lsts.imc4j.annotations.Consume;
import pt.lsts.imc4j.annotations.Periodic;
import pt.lsts.imc4j.def.SystemType;
import pt.lsts.imc4j.msg.*;
import pt.lsts.imc4j.net.ImcNetwork;
import pt.lsts.imc4j.net.UdpClient;
import pt.lsts.imc4j.util.PlanUtilities;
import pt.lsts.imc4j.util.WGS84Utilities;
import pt.lsts.ripples.controllers.WebSocketsController;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.shared.Plan;
import pt.lsts.ripples.domain.shared.Waypoint;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Component
public class ImcUdpListener {

    @Autowired
    private WebSocketsController webSocket;

    private UdpClient udpClient = new UdpClient();
    private int port = 7007;

    private ConcurrentHashMap<Integer, Asset> assets = new ConcurrentHashMap<>();

    @Consume
    void on(EstimatedState msg) {
        if (!assets.containsKey(msg.src))
            return;

        Asset asset = assets.get(msg.src);
        asset.getLastState().setDate(new Date((long)(1000*msg.timestamp)));
        double[] lld = WGS84Utilities.toLatLonDepth(msg);
        asset.getLastState().setLatitude(lld[0]);
        asset.getLastState().setLongitude(lld[1]);
        asset.getLastState().setHeading(Math.toDegrees(msg.psi));
        post(asset);
    }

    @Consume
    void on(Announce msg) {
        Asset asset = assets.getOrDefault(msg.sys_name, new Asset(msg.sys_name));
        asset.setImcid(msg.src);
        asset.getLastState().setDate(new Date((long)(1000*msg.timestamp)));
        asset.getLastState().setLatitude(Math.toDegrees(msg.lat));
        asset.getLastState().setLongitude(Math.toDegrees(msg.lon));
        assets.putIfAbsent(msg.src, asset);
        post(asset);
    }

    @Consume
    void on (FuelLevel msg) {
        if (!assets.containsKey(msg.src))
            return;
        Asset asset = assets.get(msg.src);
        asset.getLastState().setFuel(msg.value);
        post(asset);
    }

    @Consume
    void on(PlanControlState msg) {
        if (!assets.containsKey(msg.src))
            return;
        Asset asset = assets.get(msg);

        if (msg.state != PlanControlState.STATE.PCS_EXECUTING) {
            if (!asset.getPlan().getId().equals("idle")) {
                Plan plan = new Plan();
                asset.setPlan(plan);
            }
            return;
        }
        else if (!asset.getPlan().getId().equals(msg.plan_id)) {
            Plan plan = new Plan();
            plan.setId(msg.plan_id);
            asset.setPlan(plan);
            post(asset);
        }
    }

    @Consume
    void on(PlanDB msg) {
        if (!assets.containsKey(msg.src))
            return;
        Asset asset = assets.get(msg);

        if (msg.type == PlanDB.TYPE.DBT_SUCCESS && msg.op == PlanDB.OP.DBOP_GET) {
            if (asset.getPlan().getId().equals(msg.plan_id)) {
                // parse plan
                List<PlanUtilities.Waypoint> wpts = PlanUtilities.computeWaypoints((PlanSpecification) msg.arg);
                for (PlanUtilities.Waypoint wpt : wpts) {
                    Waypoint waypoint = new Waypoint();
                    waypoint.setLatitude(wpt.getLatitude());
                    waypoint.setLongitude(wpt.getLongitude());
                    waypoint.setDuration(0);
                    waypoint.setEta(-1);
                    asset.getPlan().getWaypoints().add(waypoint);
                }
                post(asset);
            }
        }
    }

    void post(Asset asset) {
        Logger.getLogger(getClass().getName()).info("Posting updated asset.");
        webSocket.sendAssetUpdateFromServerToClients(asset);
    }

    ImcUdpListener() {
        try {
            udpClient.register(this);
            udpClient.bind(port);

            ImcNetwork network = new ImcNetwork("RipplesImc", 7007, SystemType.CCU);
            network.setConnectionPolicy(p -> true);
            network.bind(EstimatedState.class, this::on);
            network.bind(Announce.class, this::on);
            network.bind(FuelLevel.class, this::on);
            network.bind(PlanControlState.class, this::on);
            network.bind(PlanDB.class, this::on);
            network.startListening(port+1);
            Logger.getLogger(getClass().getName()).info("Bound to port "+(port+1)+".");
        }
        catch (Exception e) {
            Logger.getLogger(getClass().getName()).warning("Could not bind to IMC.");
        }
    }
}
