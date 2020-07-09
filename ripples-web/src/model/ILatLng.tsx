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

export function inRange(coordinates: ILatLng): boolean {
  return latInRange(coordinates.latitude) && longInRange(coordinates.longitude)
}

export function latInRange(latitude: number): boolean {
  return isNaN(latitude) || Math.abs(latitude) <= 90
}

export function longInRange(longitude: number): boolean {
  return isNaN(longitude) || Math.abs(longitude) <= 180
}
