package pt.lsts.ripples.domain.logbook;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class MyAnnotation {

  @Id
  @GeneratedValue
  private Long id;

  private String content;

  private String username;

  private Date date;

  public MyAnnotation() {
    this.setContent("");
    this.setUsername("");
    this.setDate(new Date());
  }

  public MyAnnotation(String content, String username) {
    this.setContent(content);
    this.setUsername(username);
    this.setDate(new Date());
  }

  public Long getId() {
    return id;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }
}