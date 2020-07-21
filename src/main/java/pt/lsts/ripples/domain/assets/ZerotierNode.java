package pt.lsts.ripples.domain.assets;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class ZerotierNode {
    @Id
    private String id;

    public ZerotierNode() {
    }

    public ZerotierNode(final String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }
}