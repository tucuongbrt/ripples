import IAsset from "./IAsset";
import IProfile from "./IProfile";
import IAssetAwareness from "./IAssetAwareness";
import IAisShip from "./IAisShip";
import IPair from "./IPair";
import IAuthState from "./IAuthState";

export default interface StateType {
    vehiclePlanPairs: IPair<string>[],
    vehicles: IAsset[],
    previousVehicles: IAsset[],
    spots: IAsset[],
    profiles: IProfile[],
    aisShips: IAisShip[],
    selectedPlan: string,
    freeDrawPolygon: any[],
    sidebarOpen: boolean,
    soiAwareness: IAssetAwareness[],
    aisAwareness: IAssetAwareness[],
    sliderValue: number
    drawAwareness: boolean
    wpSelected: number
    auth: IAuthState
  };