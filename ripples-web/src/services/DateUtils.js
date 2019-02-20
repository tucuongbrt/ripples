
import moment from 'moment'

export function timestampSecToReadableDate(timestamp){
    return formatDate(new Date(timestamp*1000))
}

export function timestampMsToReadableDate(timestamp){
    return formatDate(new Date(timestamp))
}
function formatDate(date){
    return moment(date).format('MMMM Do YYYY, h:mm:ss a')
}

export function secondsToTime(secondsInput){
    let absSeconds = Math.abs(secondsInput);
    let hours = Math.floor(absSeconds/3600);
    absSeconds -= hours * 3600;
    let minutes = Math.floor(absSeconds/60);
    let seconds = absSeconds % 60;
    return `${secondsInput < 0 ? '-' : ''}${hours}h ${minutes}m ${seconds}s`
}

export function timeFromNow(timestamp){
    return moment(timestamp).fromNow(); 
}
