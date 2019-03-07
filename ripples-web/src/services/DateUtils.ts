
import moment from 'moment'

export function timestampSecToReadableDate(timestamp: number){
    return formatDate(new Date(timestamp*1000))
}

export function timestampMsToReadableDate(timestamp: number){
    return formatDate(new Date(timestamp))
}
function formatDate(date: Date){
    return moment(date).format('MMMM Do YYYY, h:mm:ss a')
}

export function secondsToTime(secondsInput: number){
    let absSeconds = Math.abs(secondsInput);
    let hours = Math.floor(absSeconds/3600);
    absSeconds -= hours * 3600;
    let minutes = Math.floor(absSeconds/60);
    let seconds = absSeconds % 60;
    return `${secondsInput < 0 ? '-' : ''}${hours}h ${minutes}m ${seconds}s`
}

export function timeFromNow(timestamp: number){
    return moment(timestamp).fromNow(); 
}

export function timestampFromDeltaHours(deltaHours: number) {
    return Date.now() + deltaHours * 3600*1000
}
