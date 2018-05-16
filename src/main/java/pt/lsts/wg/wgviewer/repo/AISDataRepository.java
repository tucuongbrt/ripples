package pt.lsts.wg.wgviewer.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.AISDatum;

@Repository
public interface AISDataRepository extends CrudRepository<AISDatum, Long>{

	List<AISDatum> findBySource(String source);
	List<AISDatum> findBySourceOrderByTimestampDesc(String source);
	List<AISDatum> findTopBySourceOrderByTimestamp(String source);

}
