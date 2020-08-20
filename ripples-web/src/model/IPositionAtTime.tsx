import ILatLng from './ILatLng'

export default interface IPositionAtTime extends ILatLng {
  timestamp: number
}

export interface IVehicleAtTime extends IPositionAtTime {
  depth: number
}

export interface ILatLngAtTime {
  lat: number
  lng: number
  timestamp: number
  depth: number
}

export interface ILatLngs {
  lat: number
  lng: number
}
