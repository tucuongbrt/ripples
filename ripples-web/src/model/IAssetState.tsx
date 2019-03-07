import ILatLng from "./ILatLng";

export default interface IAssetState extends ILatLng {
    timestamp: number
    fuel: number
    heading: number
}