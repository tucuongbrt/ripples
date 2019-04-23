import IAsset from "../model/IAsset";
import IPlan from "../model/IPlan";
import IProfile from "../model/IProfile";
import IAssetAwareness from "../model/IAssetAwareness";
import IPositionAtTime from "../model/IPositionAtTime";
import IAuthState, { isScientist } from "../model/IAuthState";
import { request } from "./RequestUtils";
import { IPotentialCollision, IPotentialCollisionPayload } from "../model/IPotentialCollision";

const apiURL = process.env.REACT_APP_API_BASE_URL

export async function mergeAssetSettings(vehicles: IAsset[], authState: IAuthState) {
  if (isScientist(authState)) {
    console.log("Fetching settings")
    const settingsPromise = fetchAssetsSettings();
    const assetSettings = await settingsPromise;
    assetSettings.forEach(entry => {
      const vehicle = vehicles.filter(v => v.name === entry.name)[0]
      console.log("entry params: ", entry.params)
      Object.keys(entry.params).sort().forEach(key => {
        vehicle.settings.push([key, entry.params[key]])
      });
    })
  }
}


export async function fetchSoiData() {
  const response = await fetch(`${apiURL}/soi`);
  const data = await response.json();
  let vehicles: IAsset[] = [];
  let spots: IAsset[] = [];
  data.forEach((system: IAsset) => {
    if (system.name.startsWith('spot')) {
      spots.push(system);
    }
    else {
      system.plan.waypoints = system.plan.waypoints.map((wp: any) =>
        Object.assign({},
          {
            timestamp: new Date(wp.arrivalDate).getTime(),
            latitude: wp.latitude,
            longitude: wp.longitude
          }))
      system.lastState.timestamp = system.lastState.timestamp * 1000
      system.settings = []
      vehicles.push(system)
    }
  });
  
  console.log("soi vehicles", vehicles)
  return { vehicles: vehicles, spots: spots };
}

type paramsType = {
  [key: string]: string;
}

type assetSettings = {
  name: string
  params: paramsType
}

async function fetchAssetsSettings() {
  const data: assetSettings[] = await request({
    url: `${apiURL}/assets/params`
  })
  console.log('assets settings:', data)
  return data
}

export async function fetchProfileData(): Promise<IProfile[]> {
  const response = await fetch(`${apiURL}/soi/profiles`);
  const data = await response.json();
  console.log('profile data:', data);
  return data;
}

async function postNewPlan(vehicleName: string, newPlan: IPlan) {
  console.log("Called post new plan")
  const response = request(
    {
      url: `${apiURL}/soi`,
      method: 'POST',
      body: JSON.stringify({ vehicleName: vehicleName, plan: newPlan })
    })
  return response;
}

export async function fetchAwareness(): Promise<IAssetAwareness[]> {
  const response = await fetch(`${apiURL}/soi/awareness`)
  const data = await response.json()
  console.log("awareness data:", data)
  return data
}

export async function sendPlanToVehicle(vehicle: IAsset) {
  let plan = JSON.parse(JSON.stringify(vehicle.plan));
  plan.waypoints = plan.waypoints.map((wp: IPositionAtTime) => {
    let timestamp = wp.timestamp
    delete wp.timestamp
    return Object.assign({}, wp, { eta: timestamp / 1000, duration: 60 })
  })
  return postNewPlan(vehicle.name, plan)
}

export async function fetchCollisions(): Promise<IPotentialCollision[]> {
  const response = await fetch(`${apiURL}/soi/risk`)
  const payload: IPotentialCollisionPayload[] = await response.json();
  console.log("Collisions", payload);
  const data: IPotentialCollision[] = payload.map(
    p => Object.assign({}, p, {timestamp: new Date(p.timestamp).getTime()})
  );
  return data;
}