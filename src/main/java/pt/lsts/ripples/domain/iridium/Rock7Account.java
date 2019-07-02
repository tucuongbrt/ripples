package pt.lsts.ripples.domain.iridium;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Rock7Account {
    @Id
    private String email;

    private String password;

    public Rock7Account() {
        this.email = null;
        this.password = null;
    }

    public Rock7Account(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

}