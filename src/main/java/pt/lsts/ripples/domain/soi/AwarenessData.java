package pt.lsts.ripples.domain.soi;

import java.util.*;

public class AwarenessData {

    private String name;
    private List<PositionAtTime> positions;

    public AwarenessData(String name){
        positions = new ArrayList<>();
        this.name = name;
    }

    public void addPosition(PositionAtTime posAtTime) {
        getPositions().add(posAtTime);
    }

    public void addPositions(List<PositionAtTime> newPos) {
        getPositions().addAll(newPos);
    }

    public String getName() {
        return name;
    }

    public List<PositionAtTime> getPositions() {
        return positions;
    }
}
