package pt.lsts.ripples.repo.main;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.ZerotierNode;

@Repository
public interface ZerotierRepository extends CrudRepository<ZerotierNode, String> {
    List<ZerotierNode> findAll();
}