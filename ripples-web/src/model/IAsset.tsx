import IWaypoint from "./IWaypoint";
import IPlan from "./IPlan";
import IAssetState from "./IAssetState";

export default interface IAsset {
    imcid: number
    name: String
    plan: IPlan
    lastState: IAssetState
}