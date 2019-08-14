package pt.lsts.ripples.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.UserLocation;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation,Long> {
	public Optional<UserLocation> findByEmail(String email);
}