package pt.lsts.ripples.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.wg.PosDatum;

@Repository
public interface PosDataRepository extends CrudRepository<PosDatum, Long>{

	List<PosDatum> findBySource(String source);
	List<PosDatum> findBySourceOrderByTimestampDesc(String source);
	List<PosDatum> findTopBySourceOrderByTimestamp(String source);

}
