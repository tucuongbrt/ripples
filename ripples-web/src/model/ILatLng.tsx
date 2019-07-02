export default interface ILatLng {
  latitude: number
  longitude: number
}

export class LatLngFactory {
  public static build(latitude: number, longitude: number): ILatLng {
    return {
      latitude: +latitude.toFixed(7),
      longitude: +longitude.toFixed(7),
    }
  }
}
