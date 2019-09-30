package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.maps.MyMaps;

@Repository
public interface MyMapsRepository extends CrudRepository<MyMaps, String>{
}