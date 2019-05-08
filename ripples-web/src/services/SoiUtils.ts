import IAsset from "../model/IAsset";
import IPlan from "../model/IPlan";
import IProfile from "../model/IProfile";
import IAssetAwareness from "../model/IAssetAwareness";
import IPositionAtTime from "../model/IPositionAtTime";
import IAuthState, { isScientist } from "../model/IAuthState";
import { request } from "./RequestUtils";
import { IPotentialCollision, IPotentialCollisionPayload } from "../model/IPotentialCollision";
import IAssetState from "../model/IAssetState";
import { string } from "prop-types";

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

type IAssetPayload = {
  name: string
  plan: IPlan
  imcid: number
  lastState: IAssetState
  settings: string[][]
  awareness: IPositionAtTime[]
}

// Converts waypoints read from the server to our type of waypoints
function convertWaypoint(wp: any) {
  return Object.assign({},
    {
      timestamp: new Date(wp.arrivalDate).getTime(),
      latitude: wp.latitude,
      longitude: wp.longitude
    })
}

export async function fetchSoiData() {
  const response = await fetch(`${apiURL}/soi`);
  const data = await response.json();
  let vehicles: IAsset[] = [];
  let spots: IAsset[] = [];
  let plans: IPlan[] = [];
  data.forEach((system: IAssetPayload) => {
    let plan: IPlan = JSON.parse(JSON.stringify(system.plan))
    delete system.plan
    if (system.name.startsWith('spot')) {
      spots.push(Object.assign({}, system, {planId: ''}))
    }
    else {
      plan.waypoints = plan.waypoints.map(wp => convertWaypoint(wp))
      system.lastState.timestamp = system.lastState.timestamp * 1000
      system.settings = []
      vehicles.push(Object.assign({}, system, {planId: plan.id}))
      plan.assignedTo = system.name
      plans.push(plan)
    }
  });
  console.log("soi vehicles", vehicles)
  return { vehicles, spots, plans };
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

async function postNewPlan(plan: IPlan) {
  console.log("Called post new plan")
  const response = request(
    {
      url: `${apiURL}/soi`,
      method: 'POST',
      body: JSON.stringify(plan)
    })
  return response;
}

export async function deleteUnassignedPlan(planId: string) {
  return request({
    url: `${apiURL}/soi/unassigned/plans`,
    method: 'DELETE',
    body: JSON.stringify({id: planId})
  })
}

export async function updatePlanId(previousId: string, newId: string) {
  return request({
    url: `${apiURL}/soi/unassigned/plans/id`,
    method: 'PATCH',
    body: JSON.stringify({previousId, newId})
  })
}

export async function sendUnassignedPlan(plan: IPlan) {
  console.log("Sending plan", plan);
  return request({
    url: `${apiURL}/soi/unassigned/plans/`,
    method: 'POST',
    body: JSON.stringify(plan)
  })
}

export async function fetchUnassignedPlans() {
  let plans: IPlan[] = await request({
    url: `${apiURL}/soi/unassigned/plans/`
  })
  plans = plans.map(p => Object.assign(p, {assignedTo: ''}));
  plans.forEach(p => p.waypoints = p.waypoints.map(wp => convertWaypoint(wp)))
  return plans
}

export async function fetchAwareness(): Promise<IAssetAwareness[]> {
  const response = await fetch(`${apiURL}/soi/awareness`)
  const data = await response.json()
  console.log("awareness data:", data)
  return data
}

export async function sendPlanToVehicle(plan: IPlan, vehicleName: string) {
  let planCopy = JSON.parse(JSON.stringify(plan))
  planCopy.assignedTo = vehicleName
  planCopy.waypoints = planCopy.waypoints.map((wp: IPositionAtTime) => {
    let timestamp = wp.timestamp
    delete wp.timestamp
    return Object.assign({}, wp, { eta: timestamp / 1000, duration: 60 })
  })
  return postNewPlan(planCopy)
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