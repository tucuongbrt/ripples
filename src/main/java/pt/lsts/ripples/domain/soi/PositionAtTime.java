package pt.lsts.ripples.domain.soi;

public class PositionAtTime {

    private double latitude;
    private double longitude;
    private long timestamp;

    public PositionAtTime(double lat, double lng, long timestampMs){
        latitude = lat;
        longitude = lng;
        timestamp = timestampMs;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
