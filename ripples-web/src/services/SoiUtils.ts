import { AssetError, AssetErrors } from '../model/AssetErrors'
import IAsset, { EmptyAsset, IAssetPayload } from '../model/IAsset'
import IAssetAwareness from '../model/IAssetAwareness'
import IAuthState, { isAdministrator, isScientist } from '../model/IAuthState'
import IPlan from '../model/IPlan'
import IPositionAtTime from '../model/IPositionAtTime'
import { IPotentialCollision, IPotentialCollisionPayload } from '../model/IPotentialCollision'
import IProfile from '../model/IProfile'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class SoiService {
  public isRipplesImc(system: IAssetPayload) {
    return system.imcid === 7007
  }

  public async mergeAssetSettings(vehicles: IAsset[], authState: IAuthState) {
    if (isScientist(authState) || isAdministrator(authState)) {
      const settingsPromise = this.fetchAssetsSettings()
      const assetSettings = await settingsPromise
      assetSettings.forEach((entry) => {
        const vehicle = vehicles.filter((v) => v.name === entry.name)[0]
        Object.keys(entry.params)
          .sort()
          .forEach((key) => {
            vehicle.settings.push([key, entry.params[key]])
          })
      })
    }
  }

  public convertAssetPayloadToAsset(system: IAssetPayload): IAsset {
    const asset: IAsset = EmptyAsset
    asset.awareness = system.awareness
    asset.imcid = system.imcid
    asset.name = system.name
    asset.settings = []
    asset.lastState = system.lastState
    asset.lastState.timestamp = system.lastState.timestamp * 1000
    asset.planId = system.plan.id
    return Object.assign({}, asset)
  }

  public convertAssetPayloadToPlan(system: IAssetPayload): IPlan {
    const plan: IPlan = JSON.parse(JSON.stringify(system.plan))
    plan.waypoints = plan.waypoints.map((wp) => this.convertSoiWaypoint(wp))
    plan.assignedTo = system.name
    plan.visible = true
    return Object.assign({}, plan)
  }

  /**
   * Method used to convert a string-keyed map to a JSON obj
   * @param strMap String-keyed map
   */
  public convertMapToObj(strMap: Map<string, string>) {
    const obj = Object.create(null)
    for (const [key, val] of strMap) {
      obj[key] = val
    }
    return obj
  }

  public async fetchSoiData() {
    const response = await fetch(`${apiURL}/soi`)
    const data = await response.json()
    const vehicles: IAsset[] = []
    const spots: IAsset[] = []
    const ccus: IAsset[] = []
    const plans: IPlan[] = []
    data.forEach((system: IAssetPayload) => {
      if (system.name.startsWith('spot')) {
        spots.push(Object.assign({}, system, { planId: '' }))
      } else if (system.name.startsWith('ccu')) {
        ccus.push(Object.assign({}, system, { planId: '' }))
      } else if (!this.isRipplesImc(system)) {
        const vehicle = this.convertAssetPayloadToAsset(system)
        vehicles.push(vehicle)
        if (system.plan.waypoints.length > 0) {
          plans.push(this.convertAssetPayloadToPlan(system))
        }
      }
    })
    return { vehicles, spots, plans, ccus }
  }

  public async fetchSoiSettings(assets: IAsset[][]) {
    assets.forEach((assetType: IAsset[]) => {
      assetType.forEach((asset: IAsset) => {
        return request({
          url: `${apiURL}/soi/assets/${asset.imcid}/settings`,
        })
      })
    })
  }

  public async updateSoiSettings(assetImcId: number, settings: Map<string, string>) {
    const settingsObj = this.convertMapToObj(settings)
    return request({
      body: JSON.stringify(settingsObj),
      method: 'POST',
      url: `${apiURL}/soi/assets/${assetImcId}/settings`,
    })
  }

  public async subscribeToSms(phoneNumber: string) {
    return request({
      body: JSON.stringify({ phoneNumber }),
      method: 'POST',
      url: `${apiURL}/sms/subscribe`,
    })
  }

  public async fetchProfileData(): Promise<IProfile[]> {
    const response = await fetch(`${apiURL}/soi/profiles`)
    const data = await response.json()
    return data
  }

  public async deleteUnassignedPlan(planId: string) {
    return request({
      body: JSON.stringify({ id: planId }),
      method: 'DELETE',
      url: `${apiURL}/soi/unassigned/plans`,
    })
  }

  public async updatePlanId(previousId: string, newId: string) {
    return request({
      body: JSON.stringify({ previousId, newId }),
      method: 'PATCH',
      url: `${apiURL}/soi/unassigned/plans/id`,
    })
  }

  public async sendUnassignedPlan(plan: IPlan) {
    const planCopy = JSON.parse(JSON.stringify(plan))
    delete planCopy.visible
    return request({
      body: JSON.stringify(planCopy),
      method: 'POST',
      url: `${apiURL}/soi/unassigned/plans/`,
    })
  }

  public async fetchUnassignedPlans() {
    let plans: IPlan[] = await request({
      url: `${apiURL}/soi/unassigned/plans/`,
    })
    plans = plans.map((p) => Object.assign(p, { assignedTo: '', visible: true }))
    plans.forEach((p) => (p.waypoints = p.waypoints.map((wp) => this.convertWaypoint(wp))))
    return plans
  }

  public async fetchAwareness(): Promise<IAssetAwareness[]> {
    const response = await fetch(`${apiURL}/soi/awareness`)
    const data = await response.json()
    return data
  }

  public async sendPlanToVehicle(plan: IPlan, vehicleName: string) {
    const planCopy = JSON.parse(JSON.stringify(plan))
    delete planCopy.visible
    planCopy.assignedTo = vehicleName
    planCopy.waypoints = planCopy.waypoints.map((wp: IPositionAtTime) => {
      const timestamp = wp.timestamp
      delete wp.timestamp
      return Object.assign({}, wp, { eta: timestamp / 1000, duration: 60 })
    })
    return this.postNewPlan(planCopy)
  }

  public async fetchCollisions(): Promise<IPotentialCollision[]> {
    const response = await fetch(`${apiURL}/soi/risk`)
    const payload: IPotentialCollisionPayload[] = await response.json()
    const data: IPotentialCollision[] = payload.map((p) =>
      Object.assign({}, p, { timestamp: new Date(p.timestamp).getTime() })
    )
    return data
  }

  public async fetchAssetsErrors(): Promise<AssetErrors[]> {
    const response: any[] = await request({ url: `${apiURL}/soi/errors` })
    return response.map((r) => {
      return new AssetErrors(
        r.name,
        r.errors.sort((a: AssetError, b: AssetError) => a.timestamp < b.timestamp)
      )
    })
  }

  public async deleteAssetErrors(assetName: string) {
    await request({ url: `${apiURL}/soi/errors/${assetName}`, method: 'DELETE' })
  }

  // Converts waypoints read from the server to our type of waypoints
  private convertWaypoint(wp: any) {
    return Object.assign(
      {},
      {
        latitude: wp.latitude,
        longitude: wp.longitude,
        timestamp: wp.timestamp,
        depth: wp.depth,
      }
    )
  }

  private convertSoiWaypoint(wp: any) {
    const waypoint: any = this.convertWaypoint(wp)
    waypoint.timestamp *= 1000
    return waypoint
  }

  private async fetchAssetsSettings() {
    const data: AssetSettings[] = await request({
      url: `${apiURL}/assets/params`,
    })
    return data
  }

  private async postNewPlan(plan: IPlan) {
    const planCopy = JSON.parse(JSON.stringify(plan))
    delete planCopy.visible
    const response = request({
      body: JSON.stringify(planCopy),
      method: 'POST',
      url: `${apiURL}/soi/plan`,
    })
    return response
  }
}

export interface ParamsType {
  [key: string]: string
}

interface AssetSettings {
  name: string
  params: ParamsType
}
