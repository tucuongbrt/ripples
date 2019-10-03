package pt.lsts.ripples.repo.backup;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.AssetPosition;

@Repository
public interface AssetPositionBackupRepository extends CrudRepository<AssetPosition, Long> {
}