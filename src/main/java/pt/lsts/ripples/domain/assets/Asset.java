package pt.lsts.ripples.domain.assets;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import pt.lsts.ripples.domain.shared.Plan;

@Entity
@Cache(usage=CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Asset implements Serializable {

    private static final long serialVersionUID = -4837003781239242004L;
	@Id
    private String name;
    private int imcid = -1;

    @Lob
    private AssetTrack track = new AssetTrack();
    
    private AssetState lastState = new AssetState();

    @ElementCollection
    private List<String> domain = new ArrayList<String>();
    
    @Lob
    private Plan plan = new Plan();

    @SuppressWarnings("unused")
	private Asset() {
    }

    public Asset(String name) {
        this.name = name;
        this.plan = new Plan();
        this.plan.setId("idle");
        this.lastState = new AssetState();
        this.lastState.setDate(new Date(0));
        this.domain = new ArrayList<String>();
    }

    public AssetState getLastState() {
        return lastState;
    }

    public void setLastState(AssetState lastState) {
        this.lastState = lastState;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
        this.track.setPlan(plan);
    }

    public String getName() {
        return name;
    }

    public int getImcid() {
        return imcid;
    }

    public void setImcid(int imcid) {
        this.imcid = imcid;
    }

    public AssetState stateAt(Date d) {
	    return track.synthesize(d);
	}

    public List<String> getDomain() {
        return domain;
    }

    public void setDomain(List<String> domain){
        this.domain = domain;
    }
}
