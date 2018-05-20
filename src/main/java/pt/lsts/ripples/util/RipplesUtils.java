package pt.lsts.ripples.util;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import pt.lsts.ripples.domain.assets.AssetPosition;
import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.domain.wg.EnvDatum;
import pt.lsts.ripples.repo.AddressesRepository;
import pt.lsts.ripples.repo.EnvDataRepository;
import pt.lsts.ripples.repo.PositionsRepository;
import pt.lsts.ripples.services.FirebaseAdapter;

@Component
public class RipplesUtils {

	@Autowired
	PositionsRepository positions;
	
	@Autowired
	EnvDataRepository dataRepo;
	
	@Autowired
	AddressesRepository addresses;
	
	@Autowired
	FirebaseAdapter firebase;
	
	private LinkedHashMap<String, EnvDatum> lastPostedData = new LinkedHashMap<>();
	private LinkedHashMap<String, AssetPosition> lastPostedPositions = new LinkedHashMap<>();
	
	public Integer resolveName(String source) {
		SystemAddress addr = addresses.findById(source).get();
		if (addr == null)
			return null;
		return addr.getImcId();
	}
	
	public SystemAddress getOrCreate(String source) {
		int lastAddress = 0;
		
		if (addresses.existsById(source))
			return addresses.findById(source).get();
		
		for (SystemAddress addr : addresses.findAll()) {
			if (addr.getImcId() > lastAddress)
				lastAddress = addr.getImcId();
		}
		
		SystemAddress addr = new SystemAddress(source);
		addr.setImcId(lastAddress+1);
		addresses.save(addr);
		return addr;
	}	
	
	public void setPosition(SystemAddress addr, double lat, double lon, Date time, boolean updateFirebase) {
		
		AssetPosition last = lastPostedPositions.get(addr.getName());
		
		if (last != null && System.currentTimeMillis() - time.getTime() > 60_000) {
			 if (time.getTime() - last.getTimestamp().getTime() < 300_000)
				 return;
		}
		
		Logger.getLogger(getClass().getSimpleName()).info("Storing position from "+addr.getName()+" ("+addr.getImcId()+") for time "+time);

		AssetPosition pos = new AssetPosition();
		pos.setLat(lat);
		pos.setLon(lon);
		pos.setTimestamp(time);
		pos.setName(addr.getName());
		pos.setImcId(addr.getImcId());
		positions.save(pos);
			
		if (updateFirebase)
			firebase.updateFirebase(pos);
		lastPostedPositions.put(addr.getName(), pos);	
	}
	
	public void setReceivedData(SystemAddress addr, double lat, double lon, Date time, Map<String, Double> data) {
	
		setPosition(addr, lat, lon, time, false);
		
		EnvDatum last = lastPostedData.get(addr.getName());
		
		if (last != null && System.currentTimeMillis() - time.getTime() > 60_000) {
			 if (last.getTimestamp().after(time))
				 return;
		}
		
		Logger.getLogger(getClass().getSimpleName()).info("Storing data from "+addr.getName()+" for time "+time);
		
		
		EnvDatum datum = new EnvDatum();
		datum.getValues().putAll(data);
		datum.setLatitude(lat);
		datum.setLongitude(lon);
		datum.setTimestamp(time);
		datum.setSource(addr.getName());
		dataRepo.save(datum);
		lastPostedData.put(addr.getName(), datum);
	}
}
