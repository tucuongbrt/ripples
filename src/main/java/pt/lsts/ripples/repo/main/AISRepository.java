package pt.lsts.ripples.repo.main;

import java.util.ArrayList;
import java.util.Date;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.AISShip;

@Repository
public interface AISRepository extends CrudRepository<AISShip, Integer> {
    ArrayList<AISShip> findByTimestampAfter(Date since);
}
