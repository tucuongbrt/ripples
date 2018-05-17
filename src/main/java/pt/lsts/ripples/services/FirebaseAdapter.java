package pt.lsts.ripples.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.springframework.stereotype.Service;

import com.firebase.client.Firebase;

import pt.lsts.imc.SoiPlan;
import pt.lsts.imc.SoiWaypoint;
import pt.lsts.ripples.domain.assets.Asset;
import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.util.SystemType;

@Service
public class FirebaseAdapter {

    private Firebase firebase = null;

    @PostConstruct
    public void init() {
        try {
            firebase = new Firebase("https://neptus.firebaseio.com/");
            firebase.goOnline();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void cleanup() {
        firebase.goOffline();
    }


    public void updateFirebase(String vehicle, SoiPlan plan) {
        Firebase planRef = firebase.child("assets/" + vehicle + "/plan").getRef();

        if (plan.getWaypoints().isEmpty()) {
            planRef.setValue(null);
        } else {
            planRef.child("id").setValue("soi_" + plan.getPlanId());
            ArrayList<double[]> locs = new ArrayList<>();
            ArrayList<Date> etas = new ArrayList<>();
            for (SoiWaypoint m : plan.getWaypoints()) {
                double lat = m.getLat();
                double lon = m.getLon();
                locs.add(new double[]{lat, lon});
                etas.add(new Date(m.getEta() * 1000l));
            }
            planRef.child("path").setValue(locs);
            planRef.child("eta").setValue(etas);
        }
    }
    
    public void updateFirebase(AssetPosition pos) {
    	Map<String, Object> assetState = new LinkedHashMap<>();
    	Map<String, Object> tmp = new LinkedHashMap<String, Object>();
        tmp.put("latitude", pos.getLat());
        tmp.put("longitude", pos.getLon());
        assetState.put("position", tmp);
        assetState.put("updated_at", pos.getTimestamp().getTime());
        String typeSys = SystemType.getSystemType(pos.getImcId());
        assetState.put("type", typeSys);
        firebase.child("assets/" + pos.getName()).getRef().updateChildren(assetState);
    }

    public void updateFirebase(Asset asset) {
        Map<String, Object> assetState = new LinkedHashMap<>();
        Map<String, Object> tmp = new LinkedHashMap<String, Object>();
        tmp.put("latitude", asset.getLastState().getLatitude());
        tmp.put("longitude", asset.getLastState().getLongitude());
        assetState.put("position", tmp);
        assetState.put("updated_at", asset.getLastState().getDate().getTime());
        String typeSys = SystemType.getSystemType(asset.getImcid());
        assetState.put("type", typeSys);
        firebase.child("assets/" + asset.getName()).getRef().updateChildren(assetState);
    }
}
