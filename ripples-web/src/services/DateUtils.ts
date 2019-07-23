import moment from 'moment'

export function decimalHoursToTime(decimalHours: number) {
  if (decimalHours === 0) {
    return 'Now'
  }
  const absTime = moment.utc(moment.duration(Math.abs(decimalHours), 'hours').as('milliseconds')).format('H[h]m[m]')
  return decimalHours < 0 ? '-' + absTime : absTime
}

export function timestampSecToReadableDate(timestamp: number) {
  return formatDate(new Date(timestamp * 1000))
}

export function timestampMsToReadableDate(timestamp: number) {
  return formatDate(new Date(timestamp))
}
function formatDate(date: Date) {
  return moment(date).format('h:mm:ss a, MMMM Do YYYY')
}

export function idFromDate(date: Date) {
  return moment(date).format('YYYYMMDDhhmmss')
}

export function secondsToTime(secondsInput: number) {
  let absSeconds = Math.abs(secondsInput)
  const hours = Math.floor(absSeconds / 3600)
  absSeconds -= hours * 3600
  const minutes = Math.floor(absSeconds / 60)
  const seconds = absSeconds % 60
  return `${secondsInput < 0 ? '-' : ''}${hours}h ${minutes}m ${seconds}s`
}

export function timeFromNow(timestamp: number) {
  return moment(timestamp).fromNow()
}

export function timestampFromDeltaHours(now: number, deltaHours: number) {
  return now + deltaHours * 3600 * 1000
}
