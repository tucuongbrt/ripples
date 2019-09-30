package pt.lsts.ripples.services;

import java.util.Date;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.ripples.domain.assets.AssetInfo;
import pt.lsts.ripples.repo.main.AssetInfoRepository;

@Service
public class AssetInfoService {

	@Autowired
	AssetInfoRepository repo;
	
	public void updateArgosAsset(int id, Map<String, String> measurements, Date time, double lat, double lon) {
		AssetInfo existing = repo.findById("argos_"+id).orElse(new AssetInfo());
		
		if (existing.getUpdated_at().after(time)) {
			Logger.getLogger(getClass().getSimpleName()).warning("Ignored older asset info for argos "+id);
			return;
		}
		
		existing.setName("argos_"+id);
		existing.setMeasurements(measurements);
		existing.setUpdated_at(time);
		existing.setLatitude(lat);
		existing.setLongitude(lon);
		existing.setMoreInfoUrl("http://www.ifremer.fr/co-argoFloats/float?ptfCode="+id);
		repo.save(existing);
		Logger.getLogger(getClass().getSimpleName()).info("Argos "+id+" updated to "+time);
	}
	
	public Iterable<AssetInfo> getInfos() {
		return repo.findAll();
	}
}
