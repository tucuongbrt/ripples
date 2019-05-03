import { createReducer } from 'redux-starter-kit'
import { setUser, removeUser, setVehicles, setAis,
setSpots, editPlan, setSlider, cancelEditPlan, setSelectedWaypointIdx,
setVehicle, setProfiles, addNewPlan, setPlans, deleteWp,
updateWpLocation, setToolSelected, addWpToPlan, savePlan } from '../ripples.actions'
import IRipplesState, { defaultAssetsGroup } from '../../model/IRipplesState'
import {noAuth} from '../../model/IAuthState';
import IAsset from '../../model/IAsset';
import { EmptyPlan } from '../../model/IPlan';
import { ToolSelected } from '../../model/ToolSelected';
import { updateWaypointsTimestampFromIndex } from '../../services/PositionUtils';

let startState: IRipplesState = {
  assets: defaultAssetsGroup,
  selectedPlan: EmptyPlan,
  sliderValue: 0,
  selectedWaypointIdx: -1,
  auth: noAuth,
  profiles: [],
  planSet: [],
  previousPlanSet: [],
  toolSelected: ToolSelected.ADD 
}

const ripplesReducer = createReducer(startState, {
  [setUser.type]: (state, action) => {
    console.log('Called Set user reducer with action: ', action)
    state.auth.currentUser = action.payload
    state.auth.authenticated = true
  },
  [removeUser.type]: (state, _) => {
    state.auth = noAuth
  },
  [setVehicles.type]: (state, action) => {
    state.assets.vehicles = action.payload
  },
  [setVehicle.type]: (state, action) => {
    const vehicle: IAsset = action.payload
    const idx = state.assets.vehicles.findIndex(v => v.imcid == vehicle.imcid)
    state.assets.vehicles[idx] = vehicle
    //state.selectedVehicle = vehicle
  },
  [setSpots.type]: (state, action) => {
    state.assets.spots = action.payload
  },
  [setAis.type]: (state, action) => {
    state.assets.aisShips = action.payload
  },
  [setPlans.type]: (state, action) => {
    state.planSet = action.payload
  },
  [editPlan.type]: (state, action) => {
    state.selectedPlan = action.payload
    state.previousPlanSet = JSON.parse(JSON.stringify(state.planSet))
  },
  [updateWpLocation.type]: (state, action) => {
    const newLocation = action.payload
    const plan = state.planSet.find(p => p.id == state.selectedPlan.id)
    if (plan != undefined) {
      const wp = plan.waypoints[state.selectedWaypointIdx]
      wp.latitude = newLocation.latitude
      wp.longitude = newLocation.longitude
      updateWaypointsTimestampFromIndex(plan.waypoints, state.selectedWaypointIdx)
    }
  },
  [deleteWp.type]: (state, action) => {
    const markerIdx = action.payload
    const plan = state.planSet.find(p => p.id == state.selectedPlan.id)
    if (plan == undefined) return
    plan.waypoints.splice(markerIdx, 1);
    updateWaypointsTimestampFromIndex(plan.waypoints, markerIdx)
  },
  [addWpToPlan.type]: (state, action) => {
    const plan = state.planSet.find(p => p.id == state.selectedPlan.id)
    if (plan != undefined) {
      plan.waypoints.push(action.payload)
      updateWaypointsTimestampFromIndex(plan.waypoints, plan.waypoints.length-1)
    }
  },
  [cancelEditPlan.type]: (state, _) => {
    state.planSet = JSON.parse(JSON.stringify(state.previousPlanSet))
    state.previousPlanSet = []
    state.selectedPlan = EmptyPlan
  },
  [savePlan.type]: (state, _) => {
    state.previousPlanSet = []
    state.selectedPlan = EmptyPlan
  },
  [setSlider.type]: (state, action) => {
    state.sliderValue = action.payload
  },
  [setSelectedWaypointIdx.type]: (state, action) => {
    state.selectedWaypointIdx = action.payload
  },
  [setProfiles.type]: (state, action) => {
    state.profiles = action.payload
  },
  [addNewPlan.type]: (state, action) => {
    state.selectedPlan = action.payload
    state.previousPlanSet = JSON.parse(JSON.stringify(state.planSet))
    state.planSet.push(state.selectedPlan)
  },
  [setToolSelected.type]: (state, action) => {
    state.toolSelected = action.payload
  }
})

export default ripplesReducer