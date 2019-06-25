import IPositionAtTime from './IPositionAtTime'

export default interface IPlan {
  id: string
  waypoints: IPositionAtTime[]
  assignedTo: string // asset name
  description: string
}

export const EmptyPlan: IPlan = {
  assignedTo: '',
  description: '',
  id: '',
  waypoints: [],
}
