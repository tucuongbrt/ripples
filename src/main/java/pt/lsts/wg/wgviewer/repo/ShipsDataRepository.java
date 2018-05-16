package pt.lsts.wg.wgviewer.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.ShipsDatum;

@Repository
public interface ShipsDataRepository extends CrudRepository<ShipsDatum, Long>{

	List<ShipsDatum> findBySource(String source);
	List<ShipsDatum> findBySourceOrderByTimestampDesc(String source);
	List<ShipsDatum> findTopBySourceOrderByTimestamp(String source);

}
