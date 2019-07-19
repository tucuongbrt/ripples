import IAisShip, { IShipLocation } from '../model/IAisShip'
import ILatLng, { LatLngFactory } from '../model/ILatLng'
import IPosHeadingAtTime from '../model/ILatLngHead'
import IPositionAtTime from '../model/IPositionAtTime'
const wgs84 = require('wgs84-util')

export const KNOTS_TO_MS = 0.514444

export function distanceInMetersBetweenCoords(p1: ILatLng, p2: ILatLng) {
  const pointA = { coordinates: [p1.longitude, p1.latitude] }
  const pointB = { coordinates: [p2.longitude, p2.latitude] }
  return wgs84.distanceBetween(pointA, pointB)
}

/**
 * Returns the most important points that define a ship, so that it can be drawn
 */
export function calculateShipLocation(aisShip: IAisShip): IShipLocation {
  const aisPos = LatLngFactory.build(aisShip.latitude, aisShip.longitude)
  const aisCoordinates = { coordinates: [aisPos.longitude, aisPos.latitude] }
  let sbVecEnd = aisPos
  let portVecEnd = aisPos
  let bowVecEnd = aisPos
  let sternVecEnd = aisPos
  const heading = aisShip.heading !== 511 ? aisShip.heading : aisShip.cog
  if (aisShip.starboard > 0) {
    const point = wgs84.destination(aisCoordinates, 90 + heading, aisShip.starboard).point.coordinates
    sbVecEnd = LatLngFactory.build(point[1], point[0])
  }
  if (aisShip.port > 0) {
    const point = wgs84.destination(aisCoordinates, 270 + heading, aisShip.port).point.coordinates
    portVecEnd = LatLngFactory.build(point[1], point[0])
  }
  if (aisShip.bow > 0) {
    const point = wgs84.destination(aisCoordinates, heading, aisShip.bow).point.coordinates
    bowVecEnd = LatLngFactory.build(point[1], point[0])
  }
  if (aisShip.stern > 0) {
    const point = wgs84.destination(aisCoordinates, 180 + heading, aisShip.stern).point.coordinates
    sternVecEnd = LatLngFactory.build(point[1], point[0])
  }
  const halfBreadthVec = vecFromPoints(sbVecEnd, portVecEnd, 0.5)
  const starboardVec = vecFromPoints(aisPos, sbVecEnd)
  const portVec = vecFromPoints(aisPos, portVecEnd)
  const sternStarboard = sumLatLngVectors(sternVecEnd, starboardVec)
  const sternPort = sumLatLngVectors(sternVecEnd, portVec)
  const lengthReducer = 0.75
  const center = sumLatLngVectors(sbVecEnd, halfBreadthVec)
  const bowVec = vecFromPoints(aisPos, bowVecEnd)
  // length overall reduced by lengthReducer
  const loaVec = vecFromPoints(sternVecEnd, bowVecEnd, lengthReducer)
  return {
    bow: sumLatLngVectors(center, bowVec),
    bowPort: sumLatLngVectors(sternPort, loaVec),
    bowStarboard: sumLatLngVectors(sternStarboard, loaVec),
    sternPort,
    sternStarboard,
  }
}

function sumLatLngVectors(v1: ILatLng, v2: ILatLng) {
  return LatLngFactory.build(v1.latitude + v2.latitude, v1.longitude + v2.longitude)
}

function vecFromPoints(p1: ILatLng, p2: ILatLng, mult = 1) {
  return LatLngFactory.build(mult * (p2.latitude - p1.latitude), mult * (p2.longitude - p1.longitude))
}

/**
 *
 * @param p Initial position
 * @param cog Course over ground
 * @param speed In meters per second
 * @param inSeconds Delta time in secods
 */
export function calculateNextPosition(
  p: IPositionAtTime,
  cog: number,
  speed: number,
  inSeconds: number
): IPositionAtTime {
  const pointA = { coordinates: [p.longitude, p.latitude] }
  const distance = speed * inSeconds
  const nextPoint = wgs84.destination(pointA, cog, distance)
  return {
    latitude: nextPoint.point.coordinates[1],
    longitude: nextPoint.point.coordinates[0],
    timestamp: p.timestamp + inSeconds * 1000,
  }
}

export function interpolateTwoPoints(
  date: number,
  prevPoint: IPositionAtTime,
  nextPoint: IPositionAtTime
): IPosHeadingAtTime {
  let ratioCompleted = 1
  if (prevPoint.timestamp !== nextPoint.timestamp) {
    ratioCompleted = (date - prevPoint.timestamp) / (nextPoint.timestamp - prevPoint.timestamp)
  }
  const pointA = { coordinates: [prevPoint.longitude, prevPoint.latitude] }
  const pointB = { coordinates: [nextPoint.longitude, nextPoint.latitude] }
  const distance = wgs84.distanceBetween(pointA, pointB) * ratioCompleted
  let heading = 0
  if (distance !== 0) {
    const bearings = wgs84.bearingsBetween(pointA, pointB)
    heading = (bearings.initialBearing + bearings.finalBearing) / 2
  }
  const midPoint = wgs84.destination(pointA, heading, distance)
  return {
    heading: midPoint.finalBearing ? midPoint.finalBearing : 0,
    latitude: midPoint.point.coordinates[1],
    longitude: midPoint.point.coordinates[0],
    timestamp: date,
  }
}

export function getPrevAndNextPoints(points: IPositionAtTime[], date: number) {
  if (points == null || points.length === 0) {
    const defaultP = { latitude: 0, longitude: 0, timestamp: date }
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
  const hourInSec = 3600
  const twelveHoursInSec = deltaHours * hourInSec
  const knotsToMetersPerSec = 0.514
  const speedMetersPerSec = currentState.sog * knotsToMetersPerSec
  const currentPosition = {
    latitude: currentState.latitude,
    longitude: currentState.longitude,
    timestamp: currentState.timestamp,
  }
  const firstPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -twelveHoursInSec)
  const oneHourAgoPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -hourInSec)
  const oneHourAfterPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, hourInSec)
  const lastPos = calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, twelveHoursInSec)
  return [firstPos, oneHourAgoPos, currentPosition, oneHourAfterPos, lastPos]
}

export function getSpeedBetweenWaypoints(waypoints: IPositionAtTime[]) {
  // need to find two waypoints with timestamps different from 0
  const scheduledWaypoints = waypoints.filter(wp => wp.timestamp > 0)
  if (scheduledWaypoints.length < 2) {
    return 1
  }
  const firstWp = scheduledWaypoints[0]
  const secondWp = scheduledWaypoints[1]
  const distanceInMeters = distanceInMetersBetweenCoords(firstWp, secondWp)
  const deltaSec = (secondWp.timestamp - firstWp.timestamp) / 1000
  return distanceInMeters / deltaSec
}

/**
 * Returns true if waypoints were updated, false otherwise
 * @param waypoints
 * @param firstIndex
 */
export function updateWaypointsTimestampFromIndex(waypoints: IPositionAtTime[], firstIndex: number) {
  if (firstIndex <= 0 || firstIndex >= waypoints.length) {
    return false
  }
  if (waypoints[0].timestamp === waypoints[1].timestamp) {
    return false
  }
  const speed = getSpeedBetweenWaypoints(waypoints)
  const lastIndex = waypoints.length - 1
  for (let i = firstIndex; i <= lastIndex; i++) {
    const prevWp = waypoints[i - 1]
    const currentWp = waypoints[i]
    const distanceInMeters = distanceInMetersBetweenCoords(prevWp, currentWp)
    currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000
  }
  return true
}
