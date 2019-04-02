import ILatLng from "./ILatLng";

export default interface IAssetState extends ILatLng {
    timestamp: number
    fuel: number
    heading: number
}

export const EmptyAssetState: IAssetState = {
    timestamp: 0,
    fuel: 0,
    heading: 0,
    latitude: 0,
    longitude: 0
}