package pt.lsts.ripples.repo.main;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.UserLocation;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation,Integer> {
	Optional<UserLocation> findByEmail(String email);
	List<UserLocation> findByTimestampAfter(Date date);
}