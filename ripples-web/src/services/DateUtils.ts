import moment from 'moment'

export default class DateService {
  public static decimalHoursToTime(decimalHours: number) {
    if (decimalHours === 0) {
      return 'Now'
    }
    const absTime = moment.duration(Math.abs(decimalHours), 'hours')
    const date = decimalHours > 0 ? moment().add(absTime, 'h') : moment().subtract(absTime, 'h')
    const hours = Math.floor(absTime.asHours())
    const mins = Math.floor(absTime.asMinutes()) - hours * 60
    const time = `${hours}h${mins}m [${date}]`
    return decimalHours < 0 ? '-' + time : time
  }

  public static timestampSecToReadableDate(timestamp: number) {
    return this.formatDate(new Date(timestamp * 1000))
  }

  public static timestampMsToReadableDate(timestamp: number) {
    return this.formatDate(new Date(timestamp))
  }

  public static timeFromNow(timestamp: number) {
    return moment(timestamp).fromNow()
  }

  public static timestampFromDeltaHours(now: number, deltaHours: number) {
    return now + deltaHours * 3600 * 1000
  }

  public static idfromDate(date: Date) {
    return moment(date).format('YYYYMMDDhhmmss')
  }

  public static formatDate(date: Date) {
    return moment(date).format('h:mm:ss a, MMMM Do YYYY')
  }

  public static formatDateOnly(date: Date) {
    return moment(date).format('MMMM Do YYYY')
  }

  public static timeOffsetToRealTime(decimalHours: number) {
    let date: Date = new Date()
    if (decimalHours !== 0) {
      let interval = moment.duration(Math.abs(decimalHours), 'hours').as('hours')
      if (decimalHours < 0) {
        interval = -interval
      }
      date = moment().add(interval, 'h').toDate()
    }
    return date
  }

  public static formatDateForRequest(date: Date) {
    return moment(date).format('YYYY-MM-DDThh:00:00.000').concat('Z')
  }

  private static secondsToTime(secondsInput: number) {
    let absSeconds = Math.abs(secondsInput)
    const hours = Math.floor(absSeconds / 3600)
    absSeconds -= hours * 3600
    const minutes = Math.floor(absSeconds / 60)
    const seconds = absSeconds % 60
    return `${secondsInput < 0 ? '-' : ''}${hours}h ${minutes}m ${seconds}s`
  }

  public static timestampToReadableDateOnly(timestamp: number) {
    const date = new Date(timestamp)
    date.setDate(date.getDate() - 1)
    return this.formatDateOnly(date)
  }
}
