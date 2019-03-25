package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import pt.lsts.ripples.domain.security.User;

import java.util.Optional;

public interface UsersRepository extends CrudRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}
