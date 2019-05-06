import IAsset from "./IAsset";
import IProfile from "./IProfile";
import IAisShip from "./IAisShip";
import IUserState from "./IAuthState";
import IPlan from "./IPlan";
import { ToolSelected } from "./ToolSelected";


export interface IAssetsGroup {
  vehicles: IAsset[],
  spots: IAsset[],
  aisShips: IAisShip[], 
}

export default interface IRipplesState {
    assets: IAssetsGroup,
    selectedPlan: IPlan, // plan id
    sliderValue: number
    selectedWaypointIdx: number
    auth: IUserState,
    profiles: IProfile[],
    planSet: IPlan[],
    previousPlanSet: IPlan[],
    toolSelected: ToolSelected
    vehicleSelected: string
  };

export const defaultAssetsGroup: IAssetsGroup = {
  vehicles: [],
  spots: [],
  aisShips: []
}