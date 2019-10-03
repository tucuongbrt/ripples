package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import pt.lsts.ripples.domain.shared.Plan;

import java.util.Optional;

@Repository
public interface UnassignedPlansRepository extends CrudRepository<Plan, Long> {

    Optional<Plan> findById(String id);
    
    @Transactional
    void deleteById(String id);


}
