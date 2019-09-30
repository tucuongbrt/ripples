package pt.lsts.ripples.repo.main;

import java.util.Date;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.wg.AISShip;

@Repository
public interface AISRepository extends CrudRepository<AISShip, Integer> {
    Iterable<AISShip> findByTimestampAfter(Date since);
}
