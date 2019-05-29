package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import pt.lsts.ripples.domain.assets.AssetError;

@Repository
public interface AssetErrorRepository extends CrudRepository<AssetError, Long> {
    Iterable<AssetError> findAllByName(String name);
    void deleteAllByName(String name);
}
