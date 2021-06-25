package pt.lsts.ripples.repo.main;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.Domain;

@Repository
public interface DomainRepository extends CrudRepository<Domain, Long> {
    List<Domain> findByName(String name);
}