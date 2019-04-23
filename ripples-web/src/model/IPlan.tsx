import IPositionAtTime from "./IPositionAtTime";
import IProfile from "./IProfile";

export default interface IPlan {
    id: string
    waypoints: IPositionAtTime[]
}

export const EmptyPlan: IPlan = {
    id: '',
    waypoints: [],
}