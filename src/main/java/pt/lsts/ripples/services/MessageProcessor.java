package pt.lsts.ripples.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Optional;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.imc.Announce;
import pt.lsts.imc.IMCMessage;
import pt.lsts.imc.SoiCommand;
import pt.lsts.imc.SoiPlan;
import pt.lsts.imc.StateReport;
import pt.lsts.imc.VerticalProfile;
import pt.lsts.ripples.controllers.WebSocketsController;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetErrors;
import pt.lsts.ripples.domain.assets.AssetParams;
import pt.lsts.ripples.domain.assets.AssetState;
import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.iridium.IridiumSubscription;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.domain.shared.Plan;
import pt.lsts.ripples.domain.shared.Waypoint;
import pt.lsts.ripples.domain.soi.VerticalProfileData;
import pt.lsts.ripples.iridium.ActivateSubscription;
import pt.lsts.ripples.iridium.DeactivateSubscription;
import pt.lsts.ripples.iridium.DeviceUpdate;
import pt.lsts.ripples.iridium.ExtendedDeviceUpdate;
import pt.lsts.ripples.iridium.ImcIridiumMessage;
import pt.lsts.ripples.iridium.IridiumCommand;
import pt.lsts.ripples.iridium.IridiumMessage;
import pt.lsts.ripples.iridium.PlainTextReport;
import pt.lsts.ripples.iridium.Position;
import pt.lsts.ripples.iridium.RockBlockIridiumSender;
import pt.lsts.ripples.repo.main.AddressesRepository;
import pt.lsts.ripples.repo.main.AssetsErrorsRepository;
import pt.lsts.ripples.repo.main.AssetsParamsRepository;
import pt.lsts.ripples.repo.main.AssetsRepository;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.SubscriptionsRepo;
import pt.lsts.ripples.repo.main.VertProfilesRepo;
import pt.lsts.ripples.util.RipplesUtils;

@Service
public class MessageProcessor {

    @Autowired
    AssetsRepository assets;

    @Autowired
    AssetsErrorsRepository assetsErrorsRepository;

    @Autowired
    AddressesRepository addresses;

    @Autowired
    AssetsParamsRepository assetParamsRepo;

    @Autowired
    SubscriptionsRepo subscriptionsRepo;

    @Autowired
    PositionsRepository positions;

    @Autowired
    Resolver resolver;

    @Autowired
    RipplesUtils ripples;

    @Autowired
    VertProfilesRepo vertProfiles;

    @Autowired
    FirebaseAdapter firebaseAdapter;

    @Autowired
    SMSService smsService;

    @Autowired
    WebSocketsController wsController;

    @Autowired
	private RockBlockIridiumSender rockBlockService;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(MessageProcessor.class);

    public MessageProcessor() {

    }

    public void route(IridiumMessage msg, String sourceImei) {
        HashSet<Integer> destinations = new HashSet<>();
        subscriptionsRepo.findAllByDeadlineAfter(new Date()).forEach(sub -> destinations.add(sub.getImcId())); // add all subscribers
        if (msg.destination != 0xFFFF)
            destinations.add(msg.destination);    
        destinations.remove(msg.source); // no loopback

        logger.info("Routing msg "+msg.getMessageType()+" to "+destinations.size()+" destinations: "+destinations);
        
        destinations.forEach(destination -> {
            msg.destination = destination;
            try {
                rockBlockService.sendMessage(msg); // redirect message to rockBlock
            } catch(Exception e){
                logger.warn(e.getLocalizedMessage());
            }
        });
    }

    public void process(IridiumMessage msg, String imei) {
        switch (msg.message_type) {
            case IridiumMessage.TYPE_DEVICE_UPDATE:
                onDeviceUpdate((DeviceUpdate) msg);
                break;
            case IridiumMessage.TYPE_EXTENDED_DEVICE_UPDATE:
                onExtendedDeviceUpdate((ExtendedDeviceUpdate) msg);
                break;
            case IridiumMessage.TYPE_IMC_IRIDIUM_MESSAGE:
                onImcIridiumMessage((ImcIridiumMessage) msg);
                break;
            case IridiumMessage.TYPE_PLAIN_TEXT:
                onPlainTextReport((PlainTextReport) msg);
                break;
            case IridiumMessage.TYPE_IRIDIUM_COMMAND:
                onIridiumCommand((IridiumCommand) msg);
                break;
            case IridiumMessage.TYPE_ACTIVATE_SUBSCRIPTION:
                onActivateSubscription((ActivateSubscription) msg, imei);
                break;
            case IridiumMessage.TYPE_DEACTIVATE_SUBSCRIPTION:
                onDeactivateSubscription((DeactivateSubscription) msg, imei);
                break;
            default:
                break;
        }
    }

    public void on(IMCMessage msg) {
        logger.info("Received IMC msg of type " + msg.getClass().getSimpleName() + " from " + msg.getSourceName());

        switch (msg.getMgid()) {
            case SoiCommand.ID_STATIC:
                incoming((SoiCommand) msg);
                break;
            case StateReport.ID_STATIC:
                incoming((StateReport) msg);
                break;
            case VerticalProfile.ID_STATIC:
                incoming((VerticalProfile) msg);
                break;
            case Announce.ID_STATIC:
                incoming((Announce) msg);
                break;
            default:
                logger.warn("Message of type " + msg.getAbbrev() + " from " + msg.getSourceName()
                        + " is not being processed.");
                break;
        }
    }

    private void addError(String assetName, String message) {
        AssetErrors error = new AssetErrors(assetName, message);
        Optional<AssetErrors> assetErrorOpt = assetsErrorsRepository.findById(assetName);
        if (assetErrorOpt.isPresent()) {
            AssetErrors assetErrors = assetErrorOpt.get();
            assetErrors.addError(message);
            assetsErrorsRepository.save(assetErrors);
        } else {
            assetsErrorsRepository.save(error);
        }

        // send sms message to all subscribers
        smsService.sendMessage(assetName + ": " + message);
    }

    /**
     * Errors are sent as iridium commands
     * 
     * @param msg
     */
    public void onIridiumCommand(IridiumCommand msg) {
        Asset vehicle = assets.findByImcid(msg.getSource());
        if (vehicle != null) {
            logger.info("Iridium command: " + msg.getCommand() + " for asset " + vehicle.getName());
            if (msg.getCommand().startsWith("ERROR")) {
                addError(vehicle.getName(), msg.getCommand());
            }
        }
    }

    /**
     * Activate Iridium subscriptions for this source
     * @param msg The subscription message
     */
    public void onActivateSubscription(ActivateSubscription msg, String imei) {
        if (imei == null) {
            logger.warn("Someone tried to subscribe to Iridium from an internet-connected computer... funny guy.");
            return;
        }

        try {
            IridiumSubscription sub = new IridiumSubscription();
            SystemAddress addr = addresses.findByImei(imei);
            if (addr == null) {
                logger.warn("Received subscription request from invalid source: "+msg.source);
                return;
            }
            sub.setImei(imei);
            sub.setImcId(msg.source);
            IridiumSubscription existing = subscriptionsRepo.findByImei(imei);
            if (existing != null)
                sub = existing;
            
            // update deadline to be 12 hours from now
            sub.setDeadline(new Date(System.currentTimeMillis() + 3600 * 12 * 1000));
            subscriptionsRepo.save(sub);
            logger.info("Added subscription for "+sub.getImei()+" until "+sub.getDeadline());
        }
        catch (Exception e) {
            logger.error("Error activating subscription", e);
        }
    }

    /**
     * Deactivate Iridium subscriptions for this source
     */
    public void onDeactivateSubscription(DeactivateSubscription msg, String imei) {
        
        if (imei == null) {
            logger.warn("Someone tried to unsubscribe to Iridium from an internet-connected computer... funny guy.");
            return;
        }
        
        try {
            SystemAddress addr = addresses.findByImei(imei);
            if (addr == null) {
                logger.warn("Received subscription deactivation request from invalid source: "+msg.source);
                return;
            }
            
            IridiumSubscription existing = subscriptionsRepo.findByImei(imei);
            if (existing != null) {
                subscriptionsRepo.delete(existing);
                logger.info("Removed subscription for "+imei+".");
            }
        }
        catch (Exception e) {
            logger.error("Error deactivating subscription", e);
        }
    }

    public void onPlainTextReport(PlainTextReport msg) {
        AssetPosition position = msg.getAssetPosition();
        if (position != null) {
            SystemAddress addr = ripples.getOrCreate(position.getName());
            // save on positions repo
            ripples.setPosition(addr, position.getLat(), position.getLon(), position.getTimestamp(), false);
            // save asset position
            setAssetPosition(position);
        }
    }

    public void onImcIridiumMessage(ImcIridiumMessage msg) {
        IMCMessage m = msg.getMsg();
        m.setSrc(msg.getSource());
        on(m);
    }

    public void incoming(VerticalProfile profile) {
        VerticalProfileData data = new VerticalProfileData(profile);
        vertProfiles.save(data);
    }

    public void incoming(Announce announce) {
        SystemAddress addr = ripples.getOrCreate(announce.getSysName());
        double lat = Math.toDegrees(announce.getLat());
        double lng = Math.toDegrees(announce.getLon());
        ripples.setPosition(addr, lat, lng, announce.getDate(), false);
        Asset asset = getOrCreateAsset(announce.getSrc(), announce.getSysName());
        AssetState assetState = asset.getLastState();
        if (assetState != null) {
            if (assetState.getDate().before(announce.getDate())) {
                assetState.setLatitude(lat);
                assetState.setLongitude(lng);
                assetState.setDate(announce.getDate());
                // update ripples clients through web sockets here
                assets.save(asset);
                wsController.sendAssetUpdateFromServerToClients(asset);
            }

        }

    }

    private Asset getOrCreateAsset(int imcId, String name) {
        Asset asset = assets.findByImcid(imcId);

        if (asset == null) {
            asset = new Asset(name);
            asset.setImcid(imcId);
        }
        return asset;
    }

    public void incoming(StateReport cmd) {
        SystemAddress addr = ripples.getOrCreate(cmd.getSourceName());
        ripples.setPosition(addr, cmd.getLatitude(), cmd.getLongitude(), cmd.getDate(), false);

        Asset asset = getOrCreateAsset(cmd.getSrc(), cmd.getSourceName());
        AssetState state = new AssetState();

        state.setFuel(cmd.getFuel());
        state.setDate(cmd.getDate());
        state.setLatitude(cmd.getLatitude());
        state.setLongitude(cmd.getLongitude());
        state.setHeading((cmd.getHeading() / 65535.0) * 360);
        asset.setLastState(state);

        assets.save(asset);
        wsController.sendAssetUpdateFromServerToClients(asset);
        logger.info("Updated SOI state for " + cmd.getSourceName());
    }

    public void incoming(SoiCommand cmd) {
        Asset vehicle = null;

        switch (cmd.getCommand()) {
            case STOP:
                if (cmd.getType() == SoiCommand.TYPE.SUCCESS) {
                    vehicle = assets.findByImcid(cmd.getSrc());
                    vehicle.setPlan(new Plan());
                    assets.save(vehicle);
                    logger.info("Vehicle stopped: " + vehicle);
                }
                break;
            case EXEC:
            case GET_PLAN:
                if (cmd.getType() == SoiCommand.TYPE.SUCCESS) {
                    vehicle = assets.findByImcid(cmd.getSrc());
                    if (vehicle != null) {
                        SoiPlan plan = cmd.getPlan();

                        if (plan == null || plan.getWaypoints().isEmpty()) {
                            vehicle.setPlan(new Plan());
                        } else {
                            Plan p = new Plan();
                            p.setId("soi_" + plan.getPlanId());
                            ArrayList<Waypoint> wpts = new ArrayList<>();
                            // TODO: Include depth in SoiWaypoint ?
                            plan.getWaypoints().forEach(wpt -> wpts
                                    .add(new Waypoint(wpt.getLat(), wpt.getLon(), wpt.getEta(), wpt.getDuration(), 0)));
                            p.setWaypoints(wpts);
                            logger.info("Received plan for " + vehicle + ": " + plan);
                            vehicle.setPlan(p);
                            assets.save(vehicle);
                        }
                    } else {
                        logger.warn("Trying to set a plan on a non-existent asset - imcId: " + cmd.getSrc());
                    }
                }
                break;
            case SET_PARAMS:
                onNewAssetParams(cmd);
                break;
            case GET_PARAMS:
                onNewAssetParams(cmd);
                break;
            default:
                logger.info(cmd.getTypeStr() + " / " + cmd.getCommandStr() + " on " + cmd.getSourceName());
                break;
        }
    }

    private void onNewAssetParams(SoiCommand cmd) {
        AssetParams params;
        if (cmd.getType() == SoiCommand.TYPE.SUCCESS) {
            Asset vehicle = assets.findByImcid(cmd.getSrc());
            LinkedHashMap<String, String> cmdSettings = cmd.getSettings();
            Optional<AssetParams> optionalAssetParams = assetParamsRepo.findById(vehicle.getName());
            if (!optionalAssetParams.isPresent()) {
                params = assetParamsRepo.save(new AssetParams(vehicle.getName(), cmdSettings));
            } else {
                AssetParams paramsInDb = optionalAssetParams.get();
                paramsInDb.addParams(cmdSettings);
                params = assetParamsRepo.save(paramsInDb);
            }
            wsController.sendAssetParamsUpdateFromServerToClients(params);
        }
    }

    public void onDeviceUpdate(DeviceUpdate devUpdate) {
        logger.info("Handling DeviceUpdate");
        try {
            for (Position p : devUpdate.getPositions().values())
                setPosition(p);
        } catch (Exception e) {
            logger.warn("Error handling DeviceUpdate", e);
        }
    }

    public void onExtendedDeviceUpdate(ExtendedDeviceUpdate devUpdate) {
        logger.info("Handling ExtendedDeviceUpdate");
        try {
            for (Position p : devUpdate.getPositions().values())
                setPosition(p);
        } catch (Exception e) {
            logger.warn("Error handling DeviceUpdate", e);
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
            logger.info("Stored updated position for " + asset.getName());
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
            logger.warn("Could not resolve imc id " + p.id);
            pos.setName("Unknown (" + p.id + ")");
        }

        setAssetPosition(pos);
    }
}
