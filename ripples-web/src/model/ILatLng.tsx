export default interface ILatLng {
    latitude: number
    longitude: number
}

export class LatLng implements ILatLng {
    constructor(public latitude: number, public longitude: number) {}
}