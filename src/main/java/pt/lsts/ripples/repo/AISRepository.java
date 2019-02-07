package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.wg.AISShip;

@Repository
public interface AISRepository extends CrudRepository<AISShip, Long> {

}
