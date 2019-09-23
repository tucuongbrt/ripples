package pt.lsts.ripples.repo;

import java.util.Date;
import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.iridium.IridiumSubscription;

@Repository
public interface SubscriptionsRepo extends CrudRepository<IridiumSubscription, Long> {
    IridiumSubscription findByImei(String imei);

    List<IridiumSubscription> findAllByDeadlineAfter(Date date);
    List<IridiumSubscription> findAllByDeadlineBefore(Date date);
    
}
