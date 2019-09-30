package pt.lsts.ripples.repo.main;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.assets.SystemAddress;

@Repository
public interface AddressesRepository extends CrudRepository<SystemAddress, String> {
    SystemAddress findByImcId(int imc_id);
    SystemAddress findByImei(long imei);
}
