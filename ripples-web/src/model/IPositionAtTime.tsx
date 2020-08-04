import ILatLng from './ILatLng'

export default interface IPositionAtTime extends ILatLng {
  timestamp: number
}

export interface ILatLngAtTime {
  lat: number
  lng: number
  timestamp: number
}

export interface ILatLngs {
  lat: number
  lng: number
}
