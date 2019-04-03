import IPlan, { EmptyPlan } from "./IPlan";
import IAssetState, { EmptyAssetState } from "./IAssetState";
import IPositionAtTime from "./IPositionAtTime";
import IPair from './IPair';

export default interface IAsset {
    imcid: number
    name: string
    plan: IPlan
    lastState: IAssetState
    settings: string[][]
    awareness: IPositionAtTime[]
}

export const EmptyAsset: IAsset = {
    imcid: -1,
    name: '',
    plan: EmptyPlan,
    lastState: EmptyAssetState,
    settings: [],
    awareness: []
}

export function isEmptyAsset(a: IAsset) {
    return a.imcid === EmptyAsset.imcid;
}