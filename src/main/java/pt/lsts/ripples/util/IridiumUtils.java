package pt.lsts.ripples.util;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.bind.DatatypeConverter;

import pt.lsts.imc.IMCDefinition;
import pt.lsts.ripples.domain.assets.AssetPosition;

public class IridiumUtils {


    private static Pattern p = Pattern.compile("\\((.)\\) \\((.*)\\) (.*) / (.*), (.*) / .*");


    public static AssetPosition parsePlainTextReport(String data) throws Exception {
		AssetPosition position = new AssetPosition();
		try {
			
			data = new String(DatatypeConverter.parseHexBinary(data));	
			System.out.println("Parsing plain text: " + data);
			Matcher matcher = p.matcher(data);
			if (!matcher.matches()) {
				throw new Exception("Text message not understood: " + data);
			}
			String type = matcher.group(1);
			String vehicle = matcher.group(2);
			String timeOfDay = matcher.group(3);
			String latMins = matcher.group(4);
			String lonMins = matcher.group(5);
			System.out.println("Vehicle: " + vehicle);
			int source = IMCDefinition.getInstance().getResolver().resolve(vehicle);
			System.out.println("Vehicle src: " + source);
			if (source == -1) {
				System.err.println("Received report from unknown system name: " + vehicle);
				return null;
			}
			String latParts[] = latMins.split(" ");
			String lonParts[] = lonMins.split(" ");
			double lat = Double.parseDouble(latParts[0]);
			lat += (lat > 0) ? Double.parseDouble(latParts[1]) / 60.0 : -Double.parseDouble(latParts[1]) / 60.0;
			double lon = Double.parseDouble(lonParts[0]);
			lon += (lon > 0) ? Double.parseDouble(lonParts[1]) / 60.0 : -Double.parseDouble(lonParts[1]) / 60.0;

			position.setTimestamp(DateUtil.parseTimeString(timeOfDay));
			position.setLat(lat);
			position.setLon(lon);
			position.setName(vehicle);
			position.setImcId(source);
			
			if (position.getTimestamp().after(new Date(System.currentTimeMillis() + 600_000))) {
				Logger.getLogger(IridiumUtils.class.getSimpleName()).log(Level.WARNING, "Received a message from the future?");
				return null;				
			}
			
			System.out.println(vehicle + " sent report (" + type + ") at time " + position.getTimestamp() + ". Position: " + lat + " / " + lon);
			return position;
		}
		catch (Exception e) {
			Logger.getLogger(IridiumUtils.class.getSimpleName()).log(Level.WARNING, "Could not parse custom message as text", e);
			return null;
		}
	}
}