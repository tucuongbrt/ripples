package pt.lsts.ripples.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Collectors;

@RestController
public class LetsEncryptController {

    @GetMapping({"/.well-known/acme-challenge/{file}"})
    public ResponseEntity<String> challenge(@PathVariable("file") String file) {
        try {
            String contents = Files.lines(Paths.get(".well-known/acme-challenge/" +
                    file.replaceAll("[^a-zA-Z0-9\\._]+", "_")))
                    .collect(Collectors.joining("\n"));

            return new ResponseEntity<String>(contents, HttpStatus.OK);
        } catch (Exception e) {
        	e.printStackTrace();
            return new ResponseEntity<>("Bad Request", HttpStatus.BAD_REQUEST);
        }
    }
}