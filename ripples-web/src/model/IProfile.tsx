import IPositionAtTime from './IPositionAtTime'

export default interface IProfile extends IPositionAtTime {
  samples: number[][]
  system: string
  type: string
}
