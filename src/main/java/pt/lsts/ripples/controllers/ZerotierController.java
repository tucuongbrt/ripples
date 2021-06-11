package pt.lsts.ripples.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

import pt.lsts.ripples.util.HTTPResponse;
import org.springframework.http.HttpStatus;

import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;

import pt.lsts.ripples.services.ZerotierService;

@RestController
public class ZerotierController {

    @Autowired
    private ZerotierService ztService;

    @Value("${zerotier.nwid}")
	private String nwid;

    @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR') or hasRole('ADMINISTRATOR')")
    @GetMapping(path = { "/zt/member/{nodeId}", "/zt/member/{nodeId}/" }, produces = "application/json")
    public ResponseEntity<HTTPResponse> addMember(@CurrentUser UserPrincipal user,
            @PathVariable(required = true) String nodeId) {
        Boolean success = ztService.joinNetwork(nodeId, user.getName(), user.getEmail());
        String msg;
        if (success) {
            msg = "zerotier-cli join " + nwid;
            return new ResponseEntity<>(new HTTPResponse("Success", msg), HttpStatus.OK);
        } else {
            msg = "An error occurred while adding node " + nodeId + " to the Ripples Zerotier network";
            return new ResponseEntity<>(new HTTPResponse("Error", msg), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}