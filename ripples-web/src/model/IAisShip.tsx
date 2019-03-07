import ILatLng from "./ILatLng";

export default interface IAisShip extends ILatLng {
    name: string
    mmsi: string
    cog: number
    sog: number
    heading: number
    type: string
    updated_at: number
}