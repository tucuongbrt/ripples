package pt.lsts.ripples.domain.shared;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Settings {

    @Id
    @GeneratedValue
    private Long id;

    private String domainName;

    @ElementCollection(fetch = FetchType.EAGER)
	public List<String[]> params = new ArrayList<String[]>();;

    public Settings() {
    }

    public Settings(String name) {
        this.domainName = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return domainName;
    }

    public void setName(String name) {
        this.domainName = name;
    }

    public List<String[]> getParams() {
        return params;
    }

    public void addParam(String[] newPar) {
        this.params.add(newPar);
    }

    public void addParams(List<String[]> newPars) {
        this.params = newPars;
    }
}