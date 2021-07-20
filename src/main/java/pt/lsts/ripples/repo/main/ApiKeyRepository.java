package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.APIKey;

@Repository
public interface ApiKeyRepository extends CrudRepository<APIKey, byte[]> {
}
