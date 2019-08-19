package pt.lsts.ripples.repo;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.AssetPosition;

@Repository
public interface PositionsRepository extends CrudRepository<AssetPosition, Long> {
    List<AssetPosition> findByName(String name);
    AssetPosition findByImcId(int imcId);
    AssetPosition findTopByImcIdOrderByTimestampDesc(int imcId);

    @Query("select distinct pos.name from AssetPosition pos")
    List<String> assetNames();
    
    List<AssetPosition> findTop100ByNameOrderByTimestampDesc(String name);
    
    List<AssetPosition> findByNameOrderByTimestamp(String name);
    List<AssetPosition> findTopByNameOrderByTimestamp(String name);
    List<AssetPosition> findTopByNameOrderByTimestampDesc(String name);
}
