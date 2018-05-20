package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.io.Serializable;
import java.util.Date;

@Entity
@Cache(usage=CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Asset implements Serializable {

    @Id
    private String name;
    private int imcid = -1;
    private AssetState lastState;
    private Plan plan;

    private Asset() {
    }

    public Asset(String name) {
        this.name = name;
        this.plan = new Plan();
        this.plan.setId("idle");
        this.lastState = new AssetState();
        this.lastState.setDate(new Date(0));
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
}
