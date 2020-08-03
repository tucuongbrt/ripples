import IPositionAtTime from './IPositionAtTime'

export default interface IPlan {
  id: string
  waypoints: IPositionAtTime[]
  assignedTo: string // asset name
  description: string
  visible: boolean
  type: string
  survey: boolean
}

export const EmptyPlan: IPlan = {
  assignedTo: '',
  description: '',
  id: '',
  waypoints: [],
  visible: false,
  type: 'backseat',
  survey: false,
}

export function isPlanEqual(plan1: IPlan, plan2: IPlan): boolean {
  return plan1.id === plan2.id && plan1.assignedTo === plan2.assignedTo
}

export function getPlanKey(p: IPlan) {
  return 'plan_' + p.id + '_' + p.assignedTo
}
