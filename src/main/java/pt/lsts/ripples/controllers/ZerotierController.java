package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.util.HTTPResponse;
import org.springframework.http.HttpStatus;

import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;

import pt.lsts.ripples.services.ZerotierService;

@RestController
public class ZerotierController {

    @Autowired
    private ZerotierService ztService;

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
    @GetMapping(path = { "/zt/member/{nodeId}", "/zt/member/{nodeId}/" }, produces = "application/json")
    public ResponseEntity<HTTPResponse> addMember(@CurrentUser UserPrincipal user,
            @PathVariable(required = true) String nodeId) {
        ztService.joinNetwork(nodeId, user.getName(), user.getEmail());
        String msg = "User " + user.getName() + " added node " + nodeId + " to ripples network";
        return new ResponseEntity<>(new HTTPResponse("Success", msg), HttpStatus.OK);
    }
}