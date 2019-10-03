package pt.lsts.ripples.repo.main;

import java.util.Date;
import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.AISShip;

@Repository
public interface AISRepository extends CrudRepository<AISShip, Integer> {
    List<AISShip> findByTimestampAfter(Date since);
}
