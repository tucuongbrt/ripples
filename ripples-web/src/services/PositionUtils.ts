import IPosHeadingAtTime from "../model/ILatLngHead";
import IPositionAtTime from "../model/IPositionAtTime";
import ILatLng from "../model/ILatLng";

function degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

export function distanceInKmBetweenCoords(p1: ILatLng, p2: ILatLng) {
    const earthRadiusKm = 6371;

    const dLat = degreesToRadians(p2.latitude - p1.latitude);
    const dLon = degreesToRadians(p2.longitude - p1.longitude);

    const lat1 = degreesToRadians(p1.latitude);
    const lat2 = degreesToRadians(p2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

export function interpolateTwoPoints(
    date: number,
    prevPoint: IPositionAtTime,
    nextPoint: IPositionAtTime): IPosHeadingAtTime 
    {
    let ratioCompleted = 1
    if (prevPoint.timestamp !== nextPoint.timestamp){
        ratioCompleted = (date - prevPoint.timestamp)/(nextPoint.timestamp - prevPoint.timestamp)
    }
    const latDelta = nextPoint.latitude - prevPoint.latitude
    const lngDelta = nextPoint.longitude - prevPoint.longitude
    const totalDelta = Math.sqrt(Math.pow(latDelta, 2) + Math.pow(lngDelta, 2))
    let cosAlpha = 1
    if (totalDelta !== 0){
        cosAlpha = latDelta / totalDelta;
    }
    let heading = Math.round(Math.acos(cosAlpha) * 180 / Math.PI)
    if (lngDelta < 0) heading = 360 - heading
    return {
        latitude: prevPoint.latitude + ratioCompleted * latDelta,
        longitude: prevPoint.longitude + ratioCompleted * lngDelta,
        heading: heading,
        timestamp: date
    }
}

export function getPrevAndNextPoints(points: IPositionAtTime[], date: number){
    if (points.length === 0) {
        let defaultP = {latitude: 0, longitude: 0, timestamp: date}
        return {prev: defaultP, next: defaultP}
    }
    if (points.length === 1 || date < points[0].timestamp){
        return {prev: points[0], next: points[0]}
    }
    if (date > points[points.length - 1].timestamp){
        return {prev: points[points.length - 1], next: points[points.length - 1]}
    }
    const prevIndex = points.findIndex((wp,i) => wp.timestamp < date && points[i+1].timestamp > date)
    return {prev: points[prevIndex], next: points[prevIndex+1]}
}

export function getLatLng(position: ILatLng){
    return {lat: position.latitude, lng: position.longitude}
}
