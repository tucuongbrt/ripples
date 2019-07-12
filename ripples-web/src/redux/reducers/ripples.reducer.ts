import { createReducer } from 'redux-starter-kit'
import IAsset from '../../model/IAsset'
import { noAuth } from '../../model/IAuthState'
import IPlan, { EmptyPlan } from '../../model/IPlan'
import IRipplesState, { defaultAssetsGroup } from '../../model/IRipplesState'
import { ToolSelected } from '../../model/ToolSelected'
import { updateWaypointsTimestampFromIndex } from '../../services/PositionUtils'
import {
  addNewPlan,
  addWpToPlan,
  cancelEditPlan,
  deleteWp,
  editPlan,
  removeUser,
  savePlan,
  selectVehicle,
  setAis,
  setPlanDescription,
  setPlans,
  setProfiles,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setSlider,
  setSpots,
  setToolSelected,
  setUser,
  setVehicles,
  togglePlanVisibility,
  unschedulePlan,
  updatePlan,
  updatePlanId,
  updateVehicle,
  updateWpLocation,
  updateWpTimestamp,
} from '../ripples.actions'

const startState: IRipplesState = {
  assets: defaultAssetsGroup,
  auth: noAuth,
  isSidePanelVisible: false,
  planSet: [],
  previousPlanSet: [],
  profiles: [],
  selectedPlan: EmptyPlan,
  selectedWaypointIdx: -1,
  sidePanelContent: {},
  sidePanelTitle: 'Click on something to get info',
  sliderValue: 0,
  toolSelected: ToolSelected.ADD,
  vehicleSelected: '',
}

const ripplesReducer = createReducer(startState, {
  [setUser.type]: (state, action) => {
    state.auth.currentUser = action.payload
    state.auth.authenticated = true
  },
  [removeUser.type]: (state, _) => {
    state.auth = noAuth
  },
  [setVehicles.type]: (state, action) => {
    state.assets.vehicles = action.payload
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
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (plan) {
      const wp = plan.waypoints[state.selectedWaypointIdx]
      wp.latitude = newLocation.latitude
      wp.longitude = newLocation.longitude
      updateWaypointsTimestampFromIndex(plan.waypoints, state.selectedWaypointIdx)
    }
  },
  [updateWpTimestamp.type]: (state, action) => {
    const { timestamp, wpIndex } = action.payload
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (plan) {
      const wp = plan.waypoints[wpIndex]
      wp.timestamp = timestamp
      updateWaypointsTimestampFromIndex(plan.waypoints, wpIndex + 1)
    }
  },
  [deleteWp.type]: (state, action) => {
    const markerIdx = action.payload
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (!plan) {
      return
    }
    plan.waypoints.splice(markerIdx, 1)
    updateWaypointsTimestampFromIndex(plan.waypoints, markerIdx)
  },
  [addWpToPlan.type]: (state, action) => {
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (plan) {
      plan.waypoints.push(action.payload)
      updateWaypointsTimestampFromIndex(plan.waypoints, plan.waypoints.length - 1)
    }
  },
  [cancelEditPlan.type]: (state, _) => {
    state.planSet = JSON.parse(JSON.stringify(state.previousPlanSet))
    state.previousPlanSet = []
    state.selectedPlan = EmptyPlan
  },
  [updatePlanId.type]: (state, action) => {
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (!plan) {
      return
    }
    state.selectedPlan.id = action.payload
    plan.id = action.payload
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
  },
  [selectVehicle.type]: (state, action) => {
    state.vehicleSelected = action.payload
  },
  [setPlanDescription.type]: (state, action) => {
    state.selectedPlan.description = action.payload
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (plan) {
      plan.description = action.payload
    }
  },
  [setSidePanelTitle.type]: (state, action) => {
    state.sidePanelTitle = action.payload
  },
  [setSidePanelContent.type]: (state, action) => {
    state.sidePanelContent = action.payload
  },
  [setSidePanelVisibility.type]: (state, action) => {
    state.isSidePanelVisible = action.payload
  },
  [unschedulePlan.type]: (state, action) => {
    const plan = state.planSet.find(p => p.id === state.selectedPlan.id)
    if (plan) {
      plan.waypoints = plan.waypoints.map(wp => Object.assign({}, wp, { timestamp: 0 }))
    }
  },
  [togglePlanVisibility.type]: (state, action) => {
    const plan = state.planSet.find(p => p.id === action.payload.id)
    if (plan) {
      plan.visible = !plan.visible
    }
  },
  [updateVehicle.type]: (state, action) => {
    const newAsset: IAsset = action.payload
    const oldAsset = state.assets.vehicles.find(v => v.imcid === newAsset.imcid)
    if (oldAsset) {
      oldAsset.lastState = newAsset.lastState
      oldAsset.planId = newAsset.planId
    } else {
      state.assets.vehicles.push(newAsset)
    }
  },
  [updatePlan.type]: (state, action) => {
    const newPlan: IPlan = action.payload
    const oldPlan = state.planSet.find(p => p.id === newPlan.id)
    if (oldPlan) {
      oldPlan.assignedTo = newPlan.assignedTo
      oldPlan.waypoints = newPlan.waypoints
    } else {
      state.planSet.push(newPlan)
    }
  },
})

export default ripplesReducer
