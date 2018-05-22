package pt.lsts.ripples.repo;

import java.util.Date;

import org.springframework.data.repository.CrudRepository;

import pt.lsts.ripples.domain.soi.VerticalProfileData;

public interface VertProfilesRepo extends CrudRepository<VerticalProfileData, Long> {
	Iterable<VerticalProfileData> findByTimestampAfter(Date since);
	Iterable<VerticalProfileData> findBySystem(String sourceName);
	Iterable<VerticalProfileData> findByType(String sampleType);
}
