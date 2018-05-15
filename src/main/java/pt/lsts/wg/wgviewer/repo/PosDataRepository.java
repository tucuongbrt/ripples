package pt.lsts.wg.wgviewer.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.PosDatum;

@Repository
public interface PosDataRepository extends CrudRepository<PosDatum, Long>{

	List<PosDatum> findBySource(String source);
	List<PosDatum> findBySourceOrderByTimestampDesc(String source);
	List<PosDatum> findTopBySourceOrderByTimestamp(String source);

}
