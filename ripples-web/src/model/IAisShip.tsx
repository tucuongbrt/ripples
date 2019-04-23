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