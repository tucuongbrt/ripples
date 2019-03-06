import Waypoint from "./Waypoint";

export default interface Vehicle {
    imcid: Number
    name: String
    plan: Waypoint[]
}