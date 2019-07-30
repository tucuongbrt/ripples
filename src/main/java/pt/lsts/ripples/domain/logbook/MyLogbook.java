package pt.lsts.ripples.domain.logbook;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class MyLogbook {

  @Id
  private String name;

  @ElementCollection
  private List<MyAnnotation> annotations;

  private Date date;

  public MyLogbook() {
    this.setName("");
    this.setAnnotations(new ArrayList<MyAnnotation>());
    this.setDate(new Date());
  }

  public MyLogbook(String name) {
    this.setName(name);
    this.setAnnotations(new ArrayList<MyAnnotation>());
    this.setDate(new Date());
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<MyAnnotation> getAnnotations() {
    return annotations;
  }

  public void setAnnotations(List<MyAnnotation> annotations) {
    this.annotations = annotations;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public void addAnnotation(MyAnnotation newAnnotation) {
    this.annotations.add(newAnnotation);
  }

  public void deleteAnnotationById(Long annotationId) {
    for (MyAnnotation annotation : this.annotations) {
      if (annotationId == annotation.getId()) {
        annotations.remove(annotation);
      }
    }
  }
}