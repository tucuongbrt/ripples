import IAssetState, { EmptyAssetState } from './IAssetState'
import IPlan from './IPlan'
import IPositionAtTime from './IPositionAtTime'

export default interface IAsset {
  imcid: number
  name: string
  planId: string
  lastState: IAssetState
  settings: string[][]
  awareness: IPositionAtTime[]
}

export const EmptyAsset: IAsset = {
  awareness: [],
  imcid: -1,
  lastState: EmptyAssetState,
  name: '',
  planId: '',
  settings: [],
}

export function isEmptyAsset(a: IAsset) {
  return a.imcid === EmptyAsset.imcid
}

export interface IAssetPayload {
  name: string
  plan: IPlan
  imcid: number
  lastState: IAssetState
  settings: string[][]
  awareness: IPositionAtTime[]
}
