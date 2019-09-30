package pt.lsts.ripples.repo.main;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.wg.AISDatum;

@Repository
public interface AISDataRepository extends CrudRepository<AISDatum, Long>{
	List<AISDatum> findBySource(String source);
	List<AISDatum> findBySourceOrderByTimestampDesc(String source);
	List<AISDatum> findTopBySourceOrderByTimestamp(String source);

}
