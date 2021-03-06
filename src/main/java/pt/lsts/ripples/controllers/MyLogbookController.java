package pt.lsts.ripples.controllers;

import java.util.ArrayList;
import java.util.List;
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
import pt.lsts.ripples.domain.logbook.NewAnnotation;
import pt.lsts.ripples.exceptions.ResourceNotFoundException;
import pt.lsts.ripples.repo.main.MyLogbookRepository;
import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class MyLogbookController {

  @Autowired
  MyLogbookRepository myLogbooksRepo;

  @Autowired
  WebSocketsController wsController;

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @GetMapping(path = { "/logbooks", "/logbooks/" }, produces = "application/json")
  public ArrayList<MyLogbook> getLogbooks() {
    ArrayList<MyLogbook> logbooks = new ArrayList<MyLogbook>();
    myLogbooksRepo.findAllByOrderByDateDesc().forEach(lb -> {
      logbooks.add(lb);
    });
    return logbooks;
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @GetMapping(path = { "/logbooks/{logbookName}", "/logbooks/{logbookName}/" }, produces = "application/json")
  public MyLogbook getLogbook(@PathVariable("logbookName") String logbookName) {
    if (logbookName.equals("default")) {
      return findDefaultLogbook();
    } else {
      Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
      if (optLogbook.isPresent()) {
        return optLogbook.get();
      } else {
        throw new ResourceNotFoundException("Logbook", "id", logbookName);
      }
    }
  }

  private MyLogbook findDefaultLogbook() {
    List<MyLogbook> logbooks = myLogbooksRepo.findAllByOrderByDateDesc();
    if (logbooks.isEmpty()) {
      throw new ResourceNotFoundException("Logbook", "id", "default");
    }
    return logbooks.get(0);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @PostMapping(path = { "/logbooks", "/logbooks/" }, consumes = "application/json", produces = "application/json")
  public ResponseEntity<HTTPResponse> addLogbook(@RequestBody MyLogbook newLogbook) {
    myLogbooksRepo.save(newLogbook);
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook " + newLogbook.getName() + " was added"),
        HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @PostMapping(path = { "/logbooks/{logbookName}",
      "/logbooks/{logbookName}/" }, consumes = "application/json", produces = "application/json")
  public ResponseEntity<HTTPResponse> addAnnotation(@CurrentUser UserPrincipal user, @PathVariable String logbookName,
      @RequestBody NewAnnotation annotationPayload) {
    MyLogbook myLogbook;
    if (logbookName.equals("default")) {
      myLogbook = findDefaultLogbook();
    } else {
      Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
      if (!optLogbook.isPresent()) {
        return new ResponseEntity<>(new HTTPResponse("Error", "Logbook not found!"), HttpStatus.NOT_FOUND);
      }
      myLogbook = optLogbook.get();
    }

    MyAnnotation annotation = new MyAnnotation(annotationPayload.getContent(), user.getUsername(),
        annotationPayload.getLatitude(), annotationPayload.getLongitude());
    myLogbook.addAnnotation(annotation);
    MyLogbook savedLogbook = myLogbooksRepo.save(myLogbook);
    List<MyAnnotation> savedAnnotations = savedLogbook.getAnnotations();
    wsController.sendAnnotationUpdate(savedAnnotations.get(savedAnnotations.size() - 1));
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook's " + logbookName + " annotation was added"),
        HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @PostMapping(path = { "/logbooks/{logbookName}/edit",
      "/logbooks/{logbookName}/edit" }, consumes = "application/json", produces = "application/json")
  public ResponseEntity<HTTPResponse> editAnnotation(@PathVariable("logbookName") String logbookName,
      @RequestBody MyAnnotation annotation) {
    MyLogbook myLogbook;
    if (logbookName.equals("default")) {
      myLogbook = findDefaultLogbook();
    } else {
      Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
      if (!optLogbook.isPresent()) {
        return new ResponseEntity<>(new HTTPResponse("Error", "Logbook not found!"), HttpStatus.NOT_FOUND);
      }
      myLogbook = optLogbook.get();
    }
    myLogbook.editAnnotation(annotation);
    myLogbooksRepo.save(myLogbook);
    return new ResponseEntity<>(new HTTPResponse("Success",
        "Annotation of id " + annotation.getId() + " of logbook " + logbookName + " was edited"), HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @DeleteMapping(path = { "/logbooks/{logbookName}", "/logbooks/{logbookName}/" }, produces = "application/json")
  public ResponseEntity<HTTPResponse> deleteAnnotation(@PathVariable("logbookName") String logbookName) {
    myLogbooksRepo.deleteById(logbookName);
    return new ResponseEntity<>(new HTTPResponse("Success", "Logbook " + logbookName + " was deleted"), HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @DeleteMapping(path = { "/logbooks/{logbookName}/{annotationId}",
      "/logbooks/{logbookName}/{annotationId}/" }, produces = "application/json")
  public ResponseEntity<HTTPResponse> deleteAnnotation(@PathVariable("logbookName") String logbookName,
      @PathVariable("annotationId") Long annotationId) {
    MyLogbook myLogbook;
    if (logbookName.equals("default")) {
      myLogbook = findDefaultLogbook();
    } else {
      Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
      if (!optLogbook.isPresent()) {
        return new ResponseEntity<>(new HTTPResponse("Error", "Logbook not found!"), HttpStatus.NOT_FOUND);
      }
      myLogbook = optLogbook.get();
    }
    myLogbook.deleteAnnotationById(annotationId);
    myLogbooksRepo.save(myLogbook);
    return new ResponseEntity<>(
        new HTTPResponse("Success", "Logbook " + logbookName + " annotation of id " + annotationId + " was deleted"),
        HttpStatus.OK);
  }

  @PreAuthorize("hasRole('SCIENTIST') or hasRole('OPERATOR')")
  @GetMapping(path = { "/logbooks/{logbookName}/annotations",
      "/logbooks/{logbookName}/annotations/" }, produces = "application/json")
  public MyAnnotation getLastAnnotation(@PathVariable String logbookName) {
    MyLogbook logbook;
    if (logbookName.equals("default")) {
      logbook = findDefaultLogbook();
    } else {
      Optional<MyLogbook> optLogbook = myLogbooksRepo.findById(logbookName);
      if (optLogbook.isPresent()) {
        logbook = optLogbook.get();
      } else {
        throw new ResourceNotFoundException("Logbook", "id", logbookName);
      }
    }
    List<MyAnnotation> annotations = logbook.getAnnotations();
    return annotations.get(annotations.size() - 1);
  }
}