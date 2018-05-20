package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Cache(usage=CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class SystemAddress {

    @Id
    private String name;
    private Integer imcId = null;
    private String imei = null;
    private String phone = null;

    private SystemAddress() {

    }

    public SystemAddress(String name) {
        this.name = name;
    }

    public Integer getImcId() {
        return imcId;
    }

    public void setImcId(Integer imcId) {
        this.imcId = imcId;
    }

    public String getImei() {
        return imei;
    }

    public void setImei(String imei) {
        this.imei = imei;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
