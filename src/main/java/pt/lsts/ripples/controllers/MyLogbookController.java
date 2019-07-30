package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import pt.lsts.ripples.domain.logbook.MyAnnotation;
import pt.lsts.ripples.domain.logbook.MyLogbook;
import pt.lsts.ripples.repo.MyLogbookRepository;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class MyLogbookController {

  @Autowired
  MyLogbookRepository myLogbooksRepo;

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @GetMapping(path = { "/logbooks", "/logbooks/" }, produces = "application/json")
  public ArrayList<MyLogbook> getLogbooks() {
    ArrayList<MyLogbook> logbooks = new ArrayList<MyLogbook>();
    myLogbooksRepo.findAll().forEach(lb -> {
      logbooks.add(lb);
    });
    return logbooks;
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @PostMapping(path = { "/logbooks", "/logbooks/" }, consumes = "application/json", produces = "application/json")
  public ResponseEntity<HTTPResponse> addLogbook(@RequestBody MyLogbook newLogbook) {
    myLogbooksRepo.save(newLogbook);
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook " + newLogbook.getName() + " was added"), HttpStatus.OK);
  }

  @DeleteMapping(path = { "/logbooks/{logbookName}", "/logbooks/{logbookName}/" }, produces = "application/json")
  public ResponseEntity<HTTPResponse> deleteLogbook(@PathVariable("logbookName") String logbookName) {
      myLogbooksRepo.deleteById(logbookName);
      return new ResponseEntity<>(new HTTPResponse("Success", "Logbook " + logbookName + " was deleted"), HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @PostMapping(path = { "/logbooks/{logbookName}", "/logbooks/{logbookName}/" }, consumes = "application/json", produces = "application/json")
  public ResponseEntity<HTTPResponse> addLogbook(@PathVariable String logbookName, @RequestBody MyAnnotation newAnnotation) {
    Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
    if (!optLogbook.isPresent()) {
        return new ResponseEntity<>(new HTTPResponse("Error", "Logbook not found!"), HttpStatus.NOT_FOUND);
    }
    MyLogbook myLogbook = optLogbook.get();
    myLogbook.addAnnotation(newAnnotation);
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook's " + logbookName + " annotation was added"), HttpStatus.OK);
  }

  @DeleteMapping(path = { "/logbooks/{logbookName}/{annotationId}", "/logbooks/{logbookName}/{annotationId}/" }, produces = "application/json")
  public ResponseEntity<HTTPResponse> deleteLogbook(@PathVariable("logbookName") String logbookName, @PathVariable("annotationId") Long annotationId) {
    Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
    if (!optLogbook.isPresent()) {
        return new ResponseEntity<>(new HTTPResponse("Error", "Logbook not found!"), HttpStatus.NOT_FOUND);
    }
    MyLogbook myLogbook = optLogbook.get();
    myLogbook.deleteAnnotationById(annotationId);
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook's " + logbookName + " annotation of id " + annotationId + " was deleted"), HttpStatus.OK);
  }
}