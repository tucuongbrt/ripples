import { GeoJsonObject } from 'geojson'
import { LatLngLiteral } from 'leaflet'

export default interface IMyMap {
  name: string
  data: GeoJsonObject
  domain: string[]
}

export interface IMapSettings extends LatLngLiteral {
  zoom: number
}
