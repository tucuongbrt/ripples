package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.exceptions.ResourceNotFoundException;
import pt.lsts.ripples.repo.UserRepository;
import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }
}