package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.iridium.Rock7Account;

@Repository
public interface Rock7AccountsRepository extends CrudRepository<Rock7Account, String> {
    
}