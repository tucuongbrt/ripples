package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.maps.GeoLayer;

@Repository
public interface GeoServerRepo extends CrudRepository<GeoLayer, String> {
}