package pt.lsts.ripples.iridium;

import pt.lsts.imc.*;
import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.util.DateUtil;

import java.util.Collection;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PlainTextReport extends IridiumMessage {

    private static Pattern p = Pattern.compile("\\((.)\\) \\((.*)\\) (.*) / (.*), (.*) / .*");

    String report;
    AssetPosition position;

    public PlainTextReport() {
        super(-1);
    }

    public PlainTextReport(String text) {
        super(-1);
        this.report = text;
    }

    @Override
    public int serializeFields(IMCOutputStream out) throws Exception {
        out.write(report.getBytes("ISO-8859-1"));
        out.close();
        return report.getBytes("ISO-8859-1").length;
    }

    @Override
    public int deserializeFields(IMCInputStream in) throws Exception {
        int bav = in.available();
        bav = bav < 0 ? 0 : bav;
        byte[] data = new byte[bav];
        int len = in.read(data);
        report = new String(data, "ISO-8859-1");
        parse();
        return len;
    }

    @Override
    public Collection<IMCMessage> asImc() {
        Vector<IMCMessage> msgs = new Vector<>();
        msgs.add(new TextMessage("iridium", report));
        return msgs;
    }

    @Override
    public String toString() {
        return "Report: " + report + "\n";
    }

    public AssetPosition getAssetPosition(){
        return position;
    }

    private void parse() {
        Matcher matcher = p.matcher(report);
        if (!matcher.matches()) {
            return;
        }
        String vehicle = matcher.group(2);
        String timeOfDay = matcher.group(3);
        String latMins = matcher.group(4);
        String lonMins = matcher.group(5);
        int source = IMCDefinition.getInstance().getResolver().resolve(vehicle);
        if (source == -1) {
            return;
        }
        String latParts[] = latMins.split(" ");
        String lonParts[] = lonMins.split(" ");
        double lat = getCoords(latParts);
        double lon = getCoords(lonParts);

        position = new AssetPosition();
        position.setTimestamp(DateUtil.parseTimeString(timeOfDay));
        position.setLat(lat);
        position.setLon(lon);
        position.setName(vehicle);
        position.setImcId(source);
    }

    private double getCoords(String[] coordParts) {
        double coord = Double.parseDouble(coordParts[0]);
        coord += (coord > 0) ? Double.parseDouble(coordParts[1]) / 60.0 : -Double.parseDouble(coordParts[1]) / 60.0;
        return coord;
    }
}


