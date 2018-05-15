package pt.lsts.wg.wgviewer.repo;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.wg.wgviewer.domain.EnvDatum;

@Repository
public interface EnvDataRepository extends CrudRepository<EnvDatum, Long>{

	List<EnvDatum> findBySource(String source);
	List<EnvDatum> findBySourceOrderByTimestampDesc(String source);
	Page<EnvDatum> findBySourceOrderByTimestampDesc(String source, Pageable page);
	List<EnvDatum> findTopBySourceOrderByTimestampDesc(String source);
	List<EnvDatum> findByTimestampAfterOrderByTimestampDesc(Date timestamp);
	List<EnvDatum> findBySourceAndTimestampAfterOrderByTimestampDesc(String source, Date timestamp);
	List<EnvDatum> findBySourceAndTimestampBetween(String source, Date timestamp1, Date timestamp2);

}
