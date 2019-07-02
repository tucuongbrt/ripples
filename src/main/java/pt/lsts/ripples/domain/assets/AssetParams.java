package pt.lsts.ripples.domain.assets;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
public class AssetParams {
    @Id
    private String name;

    @ElementCollection
    private Map<String, String> params;

    @SuppressWarnings("unused")
    private AssetParams() {
    }


    public AssetParams(String assetName, LinkedHashMap<String, String> params) {
        this.name = assetName;
        this.params = params;
    }

    public String getName() {
        return name;
    }

    public Map<String, String> getParams() {
        return params;
    }

    public void addParams(LinkedHashMap<String, String> newParams){
        params.putAll(newParams);
    }

}
