import IPositionAtTime from './IPositionAtTime'

export default interface IAssetAwareness {
  name: string // vehicle name
  positions: IPositionAtTime[]
}
