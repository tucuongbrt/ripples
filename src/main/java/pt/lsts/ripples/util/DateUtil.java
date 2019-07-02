package pt.lsts.ripples.util;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;

public class DateUtil {
	public static Date parse(String start) {

		if (start.endsWith("s") && start.startsWith("-")) {
			try {
				int secs = Integer.parseInt(start.substring(1, start.length() - 1));
				return new Date(System.currentTimeMillis() - secs * 1_000);
			} catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}

		if (start.endsWith("m") && start.startsWith("-")) {
			try {
				int mins = Integer.parseInt(start.substring(1, start.length() - 1));
				return new Date(System.currentTimeMillis() - mins * 60_000);
			} catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}

		if (start.endsWith("h") && start.startsWith("-")) {
			try {
				int hours = Integer.parseInt(start.substring(1, start.length() - 1));
				return new Date(System.currentTimeMillis() - hours * 60_000 * 60);
			} catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}

		if (start.endsWith("d") && start.startsWith("-")) {
			try {
				int days = Integer.parseInt(start.substring(1, start.length() - 1));
				return new Date(System.currentTimeMillis() - days * 60_000 * 60 * 24);
			} catch (Exception e) {
				return new Date(System.currentTimeMillis() - 24 * 3600_000);
			}
		}
		try {
			LocalDate ld = LocalDate.parse(start);
			return Date.from(ld.atStartOfDay(ZoneId.of("UTC")).toInstant());
		} catch (Exception e) {
			return new Date(System.currentTimeMillis() - 24 * 3600_000);
		}
	}

	public static Date parseTimeString(String timeOfDay) {
		GregorianCalendar date = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
		String[] timeParts = timeOfDay.split(":");
		date.set(Calendar.HOUR_OF_DAY, Integer.parseInt(timeParts[0]));
		date.set(Calendar.MINUTE, Integer.parseInt(timeParts[1]));
		date.set(Calendar.SECOND, Integer.parseInt(timeParts[2]));
		return date.getTime();
	}
}
