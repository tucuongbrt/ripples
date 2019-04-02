import IPlan, { EmptyPlan } from "./IPlan";
import IAssetState, { EmptyAssetState } from "./IAssetState";
import IPositionAtTime from "./IPositionAtTime";

export default interface IAsset {
    imcid: number
    name: string
    plan: IPlan
    lastState: IAssetState
    settings: Map<string, string>
    awareness: IPositionAtTime[]
}

export const EmptyAsset: IAsset = {
    imcid: -1,
    name: '',
    plan: EmptyPlan,
    lastState: EmptyAssetState,
    settings: new Map(),
    awareness: []
}

export function isEmptyAsset(a: IAsset) {
    return a.imcid === EmptyAsset.imcid;
}