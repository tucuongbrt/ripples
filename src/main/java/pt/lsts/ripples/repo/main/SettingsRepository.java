package pt.lsts.ripples.repo.main;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.shared.Settings;

@Repository
public interface SettingsRepository extends CrudRepository<Settings, Long> {
    List<Settings> findByDomainName(String name);
}