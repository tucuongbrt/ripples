import IPlan from "./IPlan";
import IAssetState from "./IAssetState";

export default interface IAsset {
    imcid: number
    name: string
    plan: IPlan
    lastState: IAssetState
    settings: Map<string, string>
}