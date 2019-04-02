import IPositionAtTime from "./IPositionAtTime";
import IProfile from "./IProfile";

export default interface IPlan {
    id: string
    waypoints: IPositionAtTime[]
    profiles: IProfile[],
}

export const EmptyPlan: IPlan = {
    id: '',
    waypoints: [],
    profiles: []
}