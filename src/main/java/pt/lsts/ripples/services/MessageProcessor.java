package pt.lsts.ripples.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.imc.IMCMessage;
import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiPlan;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.domain.assets.Plan;
import pt.lsts.ripples.domain.assets.Waypoint;
import pt.lsts.ripples.iridium.ActivateSubscription;
import pt.lsts.ripples.iridium.DeactivateSubscription;
import pt.lsts.ripples.iridium.DeviceUpdate;
import pt.lsts.ripples.iridium.ExtendedDeviceUpdate;
import pt.lsts.ripples.iridium.ImcIridiumMessage;
import pt.lsts.ripples.iridium.IridiumMessage;
import pt.lsts.ripples.iridium.Position;
import pt.lsts.ripples.repo.AddressesRepository;
import pt.lsts.ripples.repo.AssetsRepository;
import pt.lsts.ripples.repo.PositionsRepository;

@Service
public class MessageProcessor {

    @Autowired
    AssetsRepository assets;

    @Autowired
    AddressesRepository addresses;

    @Autowired
    PositionsRepository positions;

    @Autowired
    Resolver resolver;

    @Autowired
    FirebaseAdapter firebaseAdapter;

    public MessageProcessor() {

    }

    public void process(String imei, IridiumMessage msg) {
        Integer id = msg.getSource();

        try {
            id = addresses.findByImei(Long.parseLong(imei)).getImcId();
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (id != null)
            msg.setSource(id);

        switch (msg.message_type) {
            case IridiumMessage.TYPE_DEVICE_UPDATE:
                onDeviceUpdate((DeviceUpdate) msg);
                break;
            case IridiumMessage.TYPE_EXTENDED_DEVICE_UPDATE:
                onExtendedDeviceUpdate((ExtendedDeviceUpdate) msg);
                break;
            case IridiumMessage.TYPE_ACTIVATE_SUBSCRIPTION:
                onActivateSubscription(imei, (ActivateSubscription) msg);
                break;
            case IridiumMessage.TYPE_DEACTIVATE_SUBSCRIPTION:
                onDeactivateSubscription(imei, (DeactivateSubscription) msg);
                break;
            case IridiumMessage.TYPE_IMC_IRIDIUM_MESSAGE:
                onImcIridiumMessage((ImcIridiumMessage) msg);
                break;
            default:
                break;
        }
    }

    public void on(IMCMessage msg) {
        Logger.getLogger(MessageProcessor.class.getName()).info(
                "Received IMC msg of type " + msg.getClass().getSimpleName() + " from " + msg.getSourceName());

        switch (msg.getMgid()) {
            case SoiCommand.ID_STATIC:
                incoming((SoiCommand) msg);
                break;
            default:
                break;
        }
    }

    public void onImcIridiumMessage(ImcIridiumMessage msg) {
        IMCMessage m = msg.getMsg();

        m.setSrc(msg.getSource());

        on(m);
    }

    public void incoming(SoiCommand cmd) {
        Asset vehicle = null;

        if (cmd.getCommand() == SoiCommand.COMMAND.EXEC && cmd.getType() == SoiCommand.TYPE.REQUEST) {
            vehicle = assets.findByImcid(cmd.getDst());
        } else if (cmd.getCommand() == SoiCommand.COMMAND.GET_PLAN && cmd.getType() == SoiCommand.TYPE.SUCCESS) {
            vehicle = assets.findByImcid(cmd.getSrc());
        } else if (cmd.getCommand() == SoiCommand.COMMAND.EXEC && cmd.getType() == SoiCommand.TYPE.SUCCESS) {
            vehicle = assets.findByImcid(cmd.getSrc());
        }

        if (vehicle == null) {
            Logger.getLogger(MessageProcessor.class.getName()).warning("Command ignored: " + cmd);
            return;
        }

        SoiPlan plan = cmd.getPlan();
        firebaseAdapter.updateFirebase(vehicle.getName(), plan);

        Logger.getLogger(MessageProcessor.class.getName()).info("Received plan for " + vehicle + ": " + plan);

        if (plan == null || plan.getWaypoints().isEmpty()) {
            vehicle.setPlan(new Plan());
        } else {
            Plan p = new Plan();
            p.setId("soi_" + plan.getPlanId());
            ArrayList<Waypoint> wpts = new ArrayList<>();
            plan.getWaypoints().forEach(
                    wpt -> wpts.add(new Waypoint(wpt.getLat(), wpt.getLon(), wpt.getEta(), wpt.getDuration())));

            p.setWaypoints(wpts);
            vehicle.setPlan(p);
            assets.save(vehicle);
        }


    }

    public void onDeviceUpdate(DeviceUpdate devUpdate) {
        Logger.getLogger(MessageProcessor.class.getName()).info("Handling DeviceUpdate");
        try {
            for (Position p : devUpdate.getPositions().values())
                setPosition(p);
        } catch (Exception e) {
            Logger.getLogger(MessageProcessor.class.getName()).log(Level.WARNING,
                    "Error handling DeviceUpdate", e);
        }
    }

    public void onExtendedDeviceUpdate(ExtendedDeviceUpdate devUpdate) {
        Logger.getLogger(MessageProcessor.class.getName()).info("Handling ExtendedDeviceUpdate");
        try {
            for (Position p : devUpdate.getPositions().values())
                setPosition(p);
        } catch (Exception e) {
            Logger.getLogger(MessageProcessor.class.getName()).log(Level.WARNING,
                    "Error handling DeviceUpdate", e);
        }
    }

    public void setAssetPosition(AssetPosition pos) {
        positions.save(pos);

        Asset asset = assets.findById(pos.getName()).orElse(null);

        if (asset == null) {
            asset = new Asset(pos.getName());
            asset.setImcid(pos.getImcId());
        }

        if (asset.getLastState().getDate().before(pos.getTimestamp())) {
            AssetState state = new AssetState();
            state.setDate(pos.getTimestamp());
            state.setLatitude(pos.getLat());
            state.setLongitude(pos.getLon());
            asset.setLastState(state);
            assets.save(asset);
            Logger.getLogger(getClass().getSimpleName()).info("Stored updated position for " + asset.getName());
        }

        firebaseAdapter.updateFirebase(asset);
    }

    public void setPosition(Position p) {

        AssetPosition pos = new AssetPosition();
        pos.setImcId(p.id);
        pos.setLat(Math.toDegrees(p.latRads));
        pos.setLon(Math.toDegrees(p.lonRads));
        pos.setTimestamp(new Date((long) (p.timestamp * 1000)));
        try {
            pos.setName(resolver.resolve(p.id));
        } catch (Exception e) {
            Logger.getLogger(getClass().getSimpleName()).warning("Could not resolve imc id " + p.id);
            pos.setName("Unknown (" + p.id + ")");
        }

        setAssetPosition(pos);
    }

    public void onActivateSubscription(String imei, ActivateSubscription sub) {
        Logger.getLogger(MessageProcessor.class.getName()).info("Handling ActivateSub");
    }

    public void onDeactivateSubscription(String imei, DeactivateSubscription unsb) {
        Logger.getLogger(MessageProcessor.class.getName()).info("Handling DeactivateSub");
    }
}
