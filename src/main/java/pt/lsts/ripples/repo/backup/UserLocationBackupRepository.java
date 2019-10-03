package pt.lsts.ripples.repo.backup;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.UserLocation;

@Repository
public interface UserLocationBackupRepository extends CrudRepository<UserLocation, Long> {
}