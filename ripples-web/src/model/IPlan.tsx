import IPositionAtTime from "./IPositionAtTime";

export default interface IPlan {
    id: string
    waypoints: IPositionAtTime[]
}