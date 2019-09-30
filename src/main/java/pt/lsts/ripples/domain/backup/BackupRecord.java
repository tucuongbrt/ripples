package pt.lsts.ripples.domain.backup;

import java.util.Calendar;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;

import pt.lsts.ripples.util.DateUtil;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class BackupRecord {

	@Id
	@GeneratedValue
	private Long id;

	private String dayMonthYear;

	private int hourOfDay;

	public BackupRecord() {
		Calendar cal = Calendar.getInstance();
		setDayMonthYear(DateUtil.parseDateToString(cal));
		setHourOfDay(cal.get(Calendar.HOUR_OF_DAY));
	}

	public String getDayMonthYear() {
		return dayMonthYear;
	}

	public void setDayMonthYear(String dayMonthYear) {
		this.dayMonthYear = dayMonthYear;
	}

	public int getHourOfDay() {
		return hourOfDay;
	}

	public void setHourOfDay(int hourOfDay) {
		this.hourOfDay = hourOfDay;
	}
}