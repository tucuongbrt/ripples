package pt.lsts.ripples.repo;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.AssetErrors;

@Repository
public interface AssetsErrorsRepository extends CrudRepository<AssetErrors, String> {
    Optional<AssetErrors> findByName(String name);
    void deleteByName(String name);
}
