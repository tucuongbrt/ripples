import ILatLng from "./ILatLng";

export default interface IPositionAtTime extends ILatLng {
    timestamp: number
}