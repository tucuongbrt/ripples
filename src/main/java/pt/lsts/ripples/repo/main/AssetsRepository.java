package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.Asset;

@Repository
public interface AssetsRepository extends CrudRepository<Asset, String> {
    Asset findByImcid(int id);
}
