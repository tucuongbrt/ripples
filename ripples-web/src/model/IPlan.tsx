import IWaypoint from "./IWaypoint";

export default interface IPlan {
    id: String
    waypoints: IWaypoint[]
}