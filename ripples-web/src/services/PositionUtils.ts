import IPosHeadingAtTime from "../model/ILatLngHead";
import IPositionAtTime from "../model/IPositionAtTime";
import ILatLng from "../model/ILatLng";
import AISShip from "../scenes/Ripples/components/AISShip";
import IAisShip from "../model/IAisShip";

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
    return Math.abs(earthRadiusKm * c);
}

export function calculateNextPosition(p: IPositionAtTime, cog: number, speed: number, inSeconds: number): IPositionAtTime {
    let oneDegreeToMeters = 111139;
    let cogInRads = cog * Math.PI / 180;
    let directionVector = [Math.sin(cogInRads), Math.cos(cogInRads)]
    let deltaMoveInMeters = [directionVector[0] * speed * inSeconds, directionVector[1] * speed * inSeconds]
    return {
        longitude: p.longitude + deltaMoveInMeters[0] / oneDegreeToMeters,
        latitude: p.latitude + deltaMoveInMeters[1] / oneDegreeToMeters,
        timestamp: p.timestamp + inSeconds * 1000
    }
}

export function interpolateTwoPoints(
    date: number,
    prevPoint: IPositionAtTime,
    nextPoint: IPositionAtTime): IPosHeadingAtTime {
    let ratioCompleted = 1
    if (prevPoint.timestamp !== nextPoint.timestamp) {
        ratioCompleted = (date - prevPoint.timestamp) / (nextPoint.timestamp - prevPoint.timestamp)
    }
    const latDelta = nextPoint.latitude - prevPoint.latitude
    const lngDelta = nextPoint.longitude - prevPoint.longitude
    const totalDelta = Math.sqrt(Math.pow(latDelta, 2) + Math.pow(lngDelta, 2))
    let cosAlpha = 1
    if (totalDelta !== 0) {
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

export function getPrevAndNextPoints(points: IPositionAtTime[], date: number) {
    if (points.length === 0) {
        let defaultP = { latitude: 0, longitude: 0, timestamp: date }
        return { prev: defaultP, next: defaultP }
    }
    if (points.length === 1 || date < points[0].timestamp) {
        return { prev: points[0], next: points[0] }
    }
    if (date > points[points.length - 1].timestamp) {
        return { prev: points[points.length - 1], next: points[points.length - 1] }
    }
    const prevIndex = points.findIndex((wp, i) => wp.timestamp < date && points[i + 1].timestamp > date)
    return { prev: points[prevIndex], next: points[prevIndex + 1] }
}

export function getLatLng(position: ILatLng) {
    return { lat: position.latitude, lng: position.longitude }
}

export function estimatePositionsAtDeltaTime(currentState: IAisShip, deltaHours: number): IPositionAtTime[] {
    const twelveHoursInSec = deltaHours * 3600;
    const knotsToMetersPerSec = 0.514
    let speedMetersPerSec = currentState.sog * knotsToMetersPerSec
    let currentPosition = {
        latitude: currentState.latitude,
        longitude: currentState.longitude,
        timestamp: currentState.timestamp
    }
    let prevPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -twelveHoursInSec)
    let nextPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, twelveHoursInSec)
    return [prevPos, nextPos]
}

export function getSpeedBetweenWaypoints(waypoints: IPositionAtTime[]) {
    if (waypoints.length < 2) return 1;
    let firstWp = waypoints[0];
    let secondWp = waypoints[1];
    const distanceInMeters = distanceInKmBetweenCoords(firstWp, secondWp) * 1000;
    const deltaSec = (secondWp.timestamp - firstWp.timestamp) / 1000;
    return distanceInMeters / deltaSec;
}

/**
 * Returns true if waypoints were updated, false otherwise
 * @param waypoints 
 * @param firstIndex 
 */
export function updateWaypointsTimestampFromIndex(waypoints: IPositionAtTime[], firstIndex: number) {
    if (firstIndex <= 0 || firstIndex >= waypoints.length) {
        return false;
    }
    if (waypoints[0].timestamp == waypoints[1].timestamp) return false
    const speed = getSpeedBetweenWaypoints(waypoints)
    const lastIndex = waypoints.length - 1;
    for (let i = firstIndex; i <= lastIndex; i++) {
        let prevWp = waypoints[i - 1];
        let currentWp = waypoints[i];
        const distanceInMeters = distanceInKmBetweenCoords(prevWp, currentWp) * 1000;
        currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000;
        
    }
    return true
}