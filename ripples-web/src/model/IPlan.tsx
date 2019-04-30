import IPositionAtTime from "./IPositionAtTime";

export default interface IPlan {
    id: string
    waypoints: IPositionAtTime[]
    assignedTo: string //asset name
}

export const EmptyPlan: IPlan = {
    id: '',
    waypoints: [],
    assignedTo: ''
}