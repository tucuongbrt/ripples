package pt.lsts.ripples.repo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import pt.lsts.ripples.domain.sms.SMSSubscription;

@Repository
public interface SMSSubscriptionsRepository extends CrudRepository<SMSSubscription, String> {
    
}