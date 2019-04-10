import IAsset from "./IAsset";
import IProfile from "./IProfile";
import IAssetAwareness from "./IAssetAwareness";
import IAisShip from "./IAisShip";
import IPair from "./IPair";
import IUserState from "./IAuthState";


export interface IAssetsGroup {
  vehicles: IAsset[],
  previousVehicles: IAsset[],
  spots: IAsset[],
  aisShips: IAisShip[], 
}

export default interface IRipplesState {
    assets: IAssetsGroup,
    selectedVehicle: IAsset, // vehicle name
    sliderValue: number
    selectedWaypointIdx: number
    auth: IUserState
  };

export const defaultAssetsGroup: IAssetsGroup = {
  vehicles: [],
  previousVehicles: [],
  spots: [],
  aisShips: []
}