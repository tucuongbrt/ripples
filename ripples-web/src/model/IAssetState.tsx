import ILatLng from './ILatLng'
import IPositionAtTime from './IPositionAtTime'

export default interface IAssetState extends IPositionAtTime {
  fuel: number
  heading: number
}

export const EmptyAssetState: IAssetState = {
  fuel: 0,
  heading: 0,
  latitude: 0,
  longitude: 0,
  timestamp: 0,
}
