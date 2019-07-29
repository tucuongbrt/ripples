import moment from 'moment'

export default class DateService {
  public static decimalHoursToTime(decimalHours: number) {
    if (decimalHours === 0) {
      return 'Now'
    }
    const absTime = moment.utc(moment.duration(Math.abs(decimalHours), 'hours').as('milliseconds')).format('H[h]m[m]')
    return decimalHours < 0 ? '-' + absTime : absTime
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

  private static formatDate(date: Date) {
    return moment(date).format('h:mm:ss a, MMMM Do YYYY')
  }

  private static secondsToTime(secondsInput: number) {
    let absSeconds = Math.abs(secondsInput)
    const hours = Math.floor(absSeconds / 3600)
    absSeconds -= hours * 3600
    const minutes = Math.floor(absSeconds / 60)
    const seconds = absSeconds % 60
    return `${secondsInput < 0 ? '-' : ''}${hours}h ${minutes}m ${seconds}s`
  }
}
