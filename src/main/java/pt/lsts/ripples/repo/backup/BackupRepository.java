package pt.lsts.ripples.repo.backup;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.backup.BackupRecord;

@Repository
public interface BackupRepository extends CrudRepository<BackupRecord, Long> {
}