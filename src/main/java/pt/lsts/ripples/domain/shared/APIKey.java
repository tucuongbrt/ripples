package pt.lsts.ripples.domain.shared;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class APIKey {

    @Id
    private String token;

    private byte[] salt;
    private String email;
    private Date expirationDate;

    @ElementCollection
    private List<String> domain = new ArrayList<String>();

    @ElementCollection
    private List<String> permission = new ArrayList<String>();

    public APIKey() {
    }

    public APIKey(String email, Date date, String token, byte[] salt) {
        this.token = token;
        this.salt = salt;
        this.email = email;
        this.expirationDate = date;
        this.domain = new ArrayList<String>();
        this.permission = new ArrayList<String>();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public byte[] getSalt() {
        return salt;
    }

    public void setSalt(byte[] salt) {
        this.salt = salt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(Date date) {
        this.expirationDate = date;
    }

    public List<String> getDomain() {
        return domain;
    }

    public void setDomain(List<String> domain) {
        this.domain = domain;
    }

    public List<String> getPermission() {
        return permission;
    }

    public void setPermission(List<String> permission) {
        this.permission = permission;
    }

}
