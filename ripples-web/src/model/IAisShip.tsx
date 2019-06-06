import ILatLng from "./ILatLng";
import IPositionAtTime from "./IPositionAtTime";

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
    type: string
    timestamp: number
    awareness: IPositionAtTime[]
    location: IShipLocation
}

export class AisShip {

    static getPositionAtTime(ship: IAisShip): IPositionAtTime {
        return {
            latitude: ship.latitude,
            longitude: ship.longitude,
            timestamp: ship.timestamp
        }
    }
    static getLocation(ship: IAisShip): ILatLng {
        return {
            latitude: ship.latitude,
            longitude: ship.longitude
        }
    }
    static getDimensions(ship: IAisShip): IShipDimensions {
        return {
            bow: ship.bow,
            stern: ship.stern,
            starboard: ship.starboard,
            port: ship.port
        }
    } 
}