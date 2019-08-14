package pt.lsts.ripples.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.assets.UserLocation;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.exceptions.ResourceNotFoundException;
import pt.lsts.ripples.repo.UserLocationRepository;
import pt.lsts.ripples.repo.UserRepository;
import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLocationRepository userLocationRepository;

    @Autowired
    private WebSocketsController wsController;

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @PostMapping(path = {"/users/location", "/users/location/"}, consumes="application/json", produces="application/json")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST')")
    public ResponseEntity<HTTPResponse> updateUserLocation(@CurrentUser UserPrincipal user, @RequestBody UserLocation location) {
        UserLocation newLocation;
        Optional<UserLocation> opt = userLocationRepository.findByEmail(user.getEmail());
        if (opt.isPresent()) {
            UserLocation currentLocation = opt.get();
            currentLocation.setLatitude(location.getLatitude());
            currentLocation.setLongitude(location.getLongitude());
            currentLocation.setAccuracy(location.getAccuracy());
            newLocation = userLocationRepository.save(currentLocation);
        } else {
            newLocation = userLocationRepository.save(location);
        }
        wsController.sendUserLocationUpdate(newLocation);
        return new ResponseEntity<>(new HTTPResponse("Success","Location of user " + user.getEmail() + " updated"), HttpStatus.OK);
    }
}