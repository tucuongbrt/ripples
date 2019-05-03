package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import pt.lsts.ripples.domain.assets.Plan;

import java.util.Optional;

@Repository
public interface UnassignedPlansRepository extends CrudRepository<Plan, Long> {

    Optional<Plan> findById(String id);


}
