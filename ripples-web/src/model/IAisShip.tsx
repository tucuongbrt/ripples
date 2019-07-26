import ILatLng from './ILatLng'
import IPositionAtTime from './IPositionAtTime'

export interface IShipLocation {
  bowStarboard: ILatLng
  sternStarboard: ILatLng
  bowPort: ILatLng
  sternPort: ILatLng
  bow: ILatLng
}

export interface IShipDimensions {
  bow: number
  stern: number
  port: number
  starboard: number
}

export default interface IAisShip extends ILatLng, IShipDimensions {
  name: string
  mmsi: string
  cog: number
  sog: number
  heading: number
  type: number
  timestamp: number
  awareness: IPositionAtTime[]
  location: IShipLocation
  draught: number
  dest: string
  eta: string
}

export class AisShip {
  public static getPositionAtTime(ship: IAisShip): IPositionAtTime {
    return {
      latitude: ship.latitude,
      longitude: ship.longitude,
      timestamp: ship.timestamp,
    }
  }
  public static getLocation(ship: IAisShip): ILatLng {
    return {
      latitude: ship.latitude,
      longitude: ship.longitude,
    }
  }
  public static getDimensions(ship: IAisShip): IShipDimensions {
    return {
      bow: ship.bow,
      port: ship.port,
      starboard: ship.starboard,
      stern: ship.stern,
    }
  }
}
