package pt.lsts.ripples.domain.logbook;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class MyAnnotation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String content;

  private String username;

  private Date date;

  private double latitude;

  private double longitude;

  public MyAnnotation() {
    this.setContent("");
    this.setUsername("");
    this.setDate(new Date());
    this.setLatitude(0);
    this.setLongitude(0);
  }

  public MyAnnotation(String content, String username, double lat, double lng) {
    this.setContent(content);
    this.setUsername(username);
    this.setDate(new Date());
    this.setLatitude(lat);
    this.setLongitude(lng);
  }

  public double getLatitude() {
    return latitude;
  }

  public void setLatitude(double latitude) {
    this.latitude = latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public void setLongitude(double longitude) {
    this.longitude = longitude;
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