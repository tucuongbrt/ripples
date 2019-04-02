import IAsset from "../model/IAsset";
import IPlan from "../model/IPlan";
import IProfile from "../model/IProfile";
import IAssetAwareness from "../model/IAssetAwareness";
import IPositionAtTime from "../model/IPositionAtTime";

const apiURL = process.env.REACT_APP_API_BASE_URL

export async function fetchSoiData() {
  const settingsPromise = fetchAssetsSettings();
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
      system.settings = new Map()
      vehicles.push(system)
    }
  });
  const assetSettings = await settingsPromise;
  assetSettings.forEach(entry => {
    const vehicle = vehicles.filter(v => v.name === entry.name)[0]
    vehicle.settings = new Map(Object.entries(entry.params));
  })
  console.log("soi vehicles", vehicles)
  return { vehicles: vehicles, spots: spots };
}

type assetSettings = {
  name: string
  params: Object
}

async function fetchAssetsSettings() {
  const response = await fetch(`${apiURL}/assets/params`)
  const data: assetSettings[] = await response.json()
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
  const response = await fetch(`${apiURL}/soi`, {
    method: "POST",
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify({ vehicleName: vehicleName, plan: newPlan }),
  });
  return await Promise.all([response.ok, response.json()]);
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
    return Object.assign(wp, { eta: timestamp / 1000, duration: 60 })
  })
  return postNewPlan(vehicle.name, plan)
}