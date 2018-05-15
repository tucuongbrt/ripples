package pt.lsts.wg.wgviewer.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.EnvDatum;

@Repository
public interface EnvDataRepository extends CrudRepository<EnvDatum, Long>{

	List<EnvDatum> findBySource(String source);
	Page<EnvDatum> findBySourceOrderByTimestampDesc(String source, Pageable page);
	List<EnvDatum> findTopBySourceOrderByTimestamp(String source);

}
