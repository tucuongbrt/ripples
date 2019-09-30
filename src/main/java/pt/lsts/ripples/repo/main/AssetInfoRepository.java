package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;

import pt.lsts.ripples.domain.assets.AssetInfo;

public interface AssetInfoRepository extends CrudRepository<AssetInfo, String>{
	
}
