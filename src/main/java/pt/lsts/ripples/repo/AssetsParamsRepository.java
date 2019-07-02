package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import pt.lsts.ripples.domain.assets.AssetParams;

@Repository
public interface AssetsParamsRepository extends CrudRepository<AssetParams, String> {
}
