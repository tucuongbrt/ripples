package pt.lsts.ripples.repo.backup;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.AISShip;

@Repository
public interface AISBackupRepository extends CrudRepository<AISShip, Long> {
}