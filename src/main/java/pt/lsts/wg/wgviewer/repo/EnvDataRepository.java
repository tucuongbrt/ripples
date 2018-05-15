package pt.lsts.wg.wgviewer.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.EnvDatum;

@Repository
public interface EnvDataRepository extends CrudRepository<EnvDatum, Long>{

	List<EnvDatum> findBySource(String source);
	List<EnvDatum> findBySourceOrderByTimestampDesc(String source);
	List<EnvDatum> findTopBySourceOrderByTimestamp(String source);

}
