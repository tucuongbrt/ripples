import ILatLng from "./ILatLng";
import IAssetAwareness from "./IAssetAwareness";
import IPositionAtTime from "./IPositionAtTime";

export default interface IAisShip extends ILatLng {
    name: string
    mmsi: string
    cog: number
    sog: number
    heading: number
    type: string
    timestamp: number
    awareness: IPositionAtTime[]
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
}