package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.sms.SMSSubscription;
import pt.lsts.ripples.repo.main.SMSSubscriptionsRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class SMSController {

    @Autowired
    SMSSubscriptionsRepository smsRepo;

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
    @RequestMapping(path = { "/sms/subscribe", "/sms/subscribe/" }, method = RequestMethod.POST)
    public ResponseEntity<HTTPResponse> createSMSSubscription(@RequestBody SMSSubscription subscription) {
        smsRepo.save(subscription);
        return new ResponseEntity<>(new HTTPResponse("success", subscription.getPhoneNumber() + " subscribed to SMS."),
                HttpStatus.OK);
    }
}