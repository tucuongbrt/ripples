import IPlan, { EmptyPlan } from "./IPlan";
import IAssetState, { EmptyAssetState } from "./IAssetState";
import IPositionAtTime from "./IPositionAtTime";
import IPair from './IPair';

export default interface IAsset {
    imcid: number
    name: string
    planId: string
    lastState: IAssetState
    settings: string[][]
    awareness: IPositionAtTime[]
}

export const EmptyAsset: IAsset = {
    imcid: -1,
    name: '',
    planId: '',
    lastState: EmptyAssetState,
    settings: [],
    awareness: []
}

export function isEmptyAsset(a: IAsset) {
    return a.imcid === EmptyAsset.imcid;
}