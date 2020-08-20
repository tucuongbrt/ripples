import IAisShip, { IShipLocation } from '../model/IAisShip'
import ILatLng, { LatLngFactory } from '../model/ILatLng'
import IPosHeadingAtTime from '../model/ILatLngHead'
import IPositionAtTime, { ILatLngAtTime, ILatLngs, IVehicleAtTime } from '../model/IPositionAtTime'
const geolib = require('geolib')

const KNOTS_TO_MS = 0.514444

export default class PositionService {
  public getKnotsToMs() {
    return KNOTS_TO_MS
  }

  /**
   * Returns the most important points that define a ship, so that it can be drawn
   */
  public calculateShipLocation(aisShip: IAisShip): IShipLocation {
    const aisPos = LatLngFactory.build(aisShip.latitude, aisShip.longitude)
    const aisCoordinates = { latitude: aisPos.latitude, longitude: aisPos.longitude }
    let sbVecEnd = aisPos
    let portVecEnd = aisPos
    let bowVecEnd = aisPos
    let sternVecEnd = aisPos
    const heading = aisShip.heading !== 511 ? aisShip.heading : aisShip.cog
    if (aisShip.starboard > 0) {
      const point = geolib.computeDestinationPoint(aisCoordinates, aisShip.starboard, 90 + heading)
      sbVecEnd = LatLngFactory.build(point.latitude, point.longitude)
    }
    if (aisShip.port > 0) {
      const point = geolib.computeDestinationPoint(aisCoordinates, aisShip.port, 270 + heading)
      portVecEnd = LatLngFactory.build(point.latitude, point.longitude)
    }
    if (aisShip.bow > 0) {
      const point = geolib.computeDestinationPoint(aisCoordinates, aisShip.bow, heading)
      bowVecEnd = LatLngFactory.build(point.latitude, point.longitude)
    }
    if (aisShip.stern > 0) {
      const point = geolib.computeDestinationPoint(aisCoordinates, aisShip.stern, 180 + heading)
      sternVecEnd = LatLngFactory.build(point.latitude, point.longitude)
    }
    const halfBreadthVec = this.vecFromPoints(sbVecEnd, portVecEnd, 0.5)
    const starboardVec = this.vecFromPoints(aisPos, sbVecEnd)
    const portVec = this.vecFromPoints(aisPos, portVecEnd)
    const sternStarboard = this.sumLatLngVectors(sternVecEnd, starboardVec)
    const sternPort = this.sumLatLngVectors(sternVecEnd, portVec)
    const lengthReducer = 0.75
    const center = this.sumLatLngVectors(sbVecEnd, halfBreadthVec)
    const bowVec = this.vecFromPoints(aisPos, bowVecEnd)
    // length overall reduced by lengthReducer
    const loaVec = this.vecFromPoints(sternVecEnd, bowVecEnd, lengthReducer)
    return {
      bow: this.sumLatLngVectors(center, bowVec),
      bowPort: this.sumLatLngVectors(sternPort, loaVec),
      bowStarboard: this.sumLatLngVectors(sternStarboard, loaVec),
      sternPort,
      sternStarboard,
    }
  }

  /**
   *
   * @param p Initial position
   * @param cog Course over ground
   * @param speed In meters per second
   * @param inSeconds Delta time in secods
   */
  public calculateNextPosition(p: IPositionAtTime, cog: number, speed: number, inSeconds: number): IPositionAtTime {
    const pointA = { latitude: p.latitude, longitude: p.longitude }
    const distance = speed * inSeconds
    const nextPoint = geolib.computeDestinationPoint(pointA, distance, cog)
    return {
      latitude: nextPoint.latitude,
      longitude: nextPoint.longitude,
      timestamp: p.timestamp + inSeconds * 1000,
    }
  }

  public interpolateTwoPoints(date: number, prevPoint: IPositionAtTime, nextPoint: IPositionAtTime): IPosHeadingAtTime {
    let ratioCompleted = 1
    if (prevPoint.timestamp !== nextPoint.timestamp) {
      ratioCompleted = (date - prevPoint.timestamp) / (nextPoint.timestamp - prevPoint.timestamp)
    }
    const pointA = { latitude: prevPoint.latitude, longitude: prevPoint.longitude }
    const pointB = { latitude: nextPoint.latitude, longitude: nextPoint.longitude }
    const distance = geolib.getDistance(pointA, pointB) * ratioCompleted
    let heading = 0
    if (distance !== 0) {
      heading = geolib.getRhumbLineBearing(pointA, pointB)
    }
    const midPointCoordinates = geolib.computeDestinationPoint(pointA, distance, heading)
    return {
      heading,
      latitude: midPointCoordinates.latitude,
      longitude: midPointCoordinates.longitude,
      timestamp: date,
    }
  }

  public getHeadingFromTwoPoints(start: ILatLng, end: ILatLng) {
    return geolib.getRhumbLineBearing(start, end)
  }

  public getPrevAndNextPoints(points: IPositionAtTime[], date: number) {
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

  public getLatLng(position: ILatLng) {
    return { lat: position.latitude, lng: position.longitude }
  }

  public getLatLngFromArray(positions: IVehicleAtTime[]) {
    return positions.map((p) => {
      return {
        lat: p.latitude,
        lng: p.longitude,
      }
    })
  }

  public getILatLngFromArray(positions: ILatLngAtTime[]) {
    return positions.map((p) => {
      return {
        latitude: p.lat,
        longitude: p.lng,
        timestamp: p.timestamp ? p.timestamp : 0,
        depth: p.depth,
      }
    })
  }

  public getPositionsFromArray(positions: ILatLngs[]) {
    return positions.map((p) => {
      return {
        latitude: p.lat,
        longitude: p.lng,
      }
    })
  }

  public getPosAtTime(positions: ILatLngs[]) {
    return positions.map((p) => {
      return { ...p, timestamp: 0, depth: 0 }
    })
  }

  public estimatePositionsAtDeltaTime(currentState: IAisShip, deltaHours: number): IPositionAtTime[] {
    if (currentState.heading === 511 && currentState.cog === 360) {
      return []
    }
    const hourInSec = 3600
    const twelveHoursInSec = deltaHours * hourInSec
    const knotsToMetersPerSec = 0.514
    const speedMetersPerSec = currentState.sog * knotsToMetersPerSec
    const currentPosition = {
      latitude: currentState.latitude,
      longitude: currentState.longitude,
      timestamp: currentState.timestamp,
    }
    const firstPos = this.calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, -twelveHoursInSec)
    const lastPos = this.calculateNextPosition(currentPosition, currentState.cog, speedMetersPerSec, twelveHoursInSec)
    return [firstPos, currentPosition, lastPos]
  }

  /**
   * Returns true if waypoints were updated, false otherwise
   * @param waypoints
   * @param firstIndex
   */
  public updateWaypointsTimestampFromIndex(waypoints: IPositionAtTime[], firstIndex: number) {
    if (firstIndex <= 0 || firstIndex >= waypoints.length) {
      return false
    }
    if (waypoints[0].timestamp === waypoints[1].timestamp) {
      return false
    }
    const speed = this.getSpeedBetweenWaypoints(waypoints)
    const lastIndex = waypoints.length - 1
    for (let i = firstIndex; i <= lastIndex; i++) {
      const prevWp = waypoints[i - 1]
      const currentWp = waypoints[i]
      const distanceInMeters = this.distanceInMetersBetweenCoords(prevWp, currentWp)
      if (prevWp.timestamp === 0) {
        currentWp.timestamp = 0
      } else {
        currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000
      }
    }
    return true
  }

  public distanceInMetersBetweenCoords(p1: ILatLng, p2: ILatLng) {
    const pointA = { latitude: p1.latitude, longitude: p1.longitude }
    const pointB = { latitude: p2.latitude, longitude: p2.longitude }
    return geolib.getDistance(pointA, pointB)
  }

  public measureTotalDistance(positions: ILatLng[]): number {
    let sum = 0
    for (let i = 0; i < positions.length - 1; i++) {
      sum += this.distanceInMetersBetweenCoords(positions[i], positions[i + 1])
    }
    return sum
  }

  private sumLatLngVectors(v1: ILatLng, v2: ILatLng) {
    return LatLngFactory.build(v1.latitude + v2.latitude, v1.longitude + v2.longitude)
  }

  private vecFromPoints(p1: ILatLng, p2: ILatLng, mult = 1) {
    return LatLngFactory.build(mult * (p2.latitude - p1.latitude), mult * (p2.longitude - p1.longitude))
  }

  private getSpeedBetweenWaypoints(waypoints: IPositionAtTime[]) {
    // need to find two waypoints with timestamps different from 0
    const scheduledWaypoints = waypoints.filter((wp) => wp.timestamp > 0)
    if (scheduledWaypoints.length < 2) {
      return 1
    }
    const firstWp = scheduledWaypoints[0]
    const secondWp = scheduledWaypoints[1]
    const distanceInMeters = this.distanceInMetersBetweenCoords(firstWp, secondWp)
    const deltaSec = (secondWp.timestamp - firstWp.timestamp) / 1000
    return distanceInMeters / deltaSec
  }
}
