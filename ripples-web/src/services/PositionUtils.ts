import IPosHeadingAtTime from "../model/ILatLngHead";
import IPositionAtTime from "../model/IPositionAtTime";
import ILatLng from "../model/ILatLng";
import IAisShip from "../model/IAisShip";
const wgs84 = require("wgs84-util");

export function distanceInMetersBetweenCoords(p1: ILatLng, p2: ILatLng) {
    const pointA = {coordinates: [p1.longitude, p1.latitude]}
    const pointB = {coordinates: [p2.longitude, p2.latitude]}
    return wgs84.distanceBetween(pointA, pointB);
}

export function calculateNextPosition(p: IPositionAtTime, cog: number, speed: number, inSeconds: number): IPositionAtTime {
    const pointA = {coordinates: [p.longitude, p.latitude]}
    const distance = speed * inSeconds;
    const nextPoint = wgs84.destination(pointA, cog, distance)
    return {
        latitude: nextPoint.point.coordinates[1],
        longitude: nextPoint.point.coordinates[0],
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
    const pointA = {coordinates: [prevPoint.longitude, prevPoint.latitude]}
    const pointB = {coordinates: [nextPoint.longitude, nextPoint.latitude]}
    const distance = wgs84.distanceBetween(pointA, pointB)*ratioCompleted;
    let heading = 0;
    if (distance != 0) {
        const bearings = wgs84.bearingsBetween(pointA, pointB)
        heading = (bearings.initialBearing + bearings.finalBearing) / 2
    }
    const midPoint = wgs84.destination(pointA, heading, distance)
    return {
        latitude: midPoint.point.coordinates[1],
        longitude: midPoint.point.coordinates[0],
        heading: 0 | midPoint.finalBearing,
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
    const hourInSec = 3600;
    const twelveHoursInSec = deltaHours * hourInSec;
    const knotsToMetersPerSec = 0.514
    let speedMetersPerSec = currentState.sog * knotsToMetersPerSec
    let currentPosition = {
        latitude: currentState.latitude,
        longitude: currentState.longitude,
        timestamp: currentState.timestamp
    }
    let firstPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -twelveHoursInSec)
    let oneHourAgoPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -hourInSec)
    let oneHourAfterPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, hourInSec)
    let lastPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, twelveHoursInSec)
    return [firstPos, oneHourAgoPos, currentPosition, oneHourAfterPos, lastPos]
}

export function getSpeedBetweenWaypoints(waypoints: IPositionAtTime[]) {
    if (waypoints.length < 2) return 1;
    let firstWp = waypoints[0];
    let secondWp = waypoints[1];
    const distanceInMeters = distanceInMetersBetweenCoords(firstWp, secondWp);
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
        const distanceInMeters = distanceInMetersBetweenCoords(prevWp, currentWp);
        currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000;
        
    }
    return true
}