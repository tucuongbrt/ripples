import Waypoint from "./Waypoint";
import Plan from "./Plan";

export default interface Asset {
    imcid: Number
    name: String
    plan: Plan
}