import { createReducer } from 'redux-starter-kit'
import IAisShip from '../../model/IAisShip'
import IAsset from '../../model/IAsset'
import { noAuth } from '../../model/IAuthState'
import ILatLng from '../../model/ILatLng'
import IPlan, { EmptyPlan, isPlanEqual } from '../../model/IPlan'
import IRipplesState, { defaultAssetsGroup } from '../../model/IRipplesState'
import { ToolSelected } from '../../model/ToolSelected'
import PositionService from '../../services/PositionUtils'
import {
  addAnnotation,
  addMeasurePoint,
  addNewPlan,
  addWpToPlan,
  cancelEditPlan,
  clearMeasure,
  deleteWp,
  editPlan,
  removeUser,
  savePlan,
  selectVehicle,
  setAis,
  setAnnotations,
  setCcus,
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
  updateAIS,
  updateCCU,
  updatePlan,
  updatePlanId,
  updateSpot,
  updateVehicle,
  updateWpLocation,
  updateWpTimestamp,
} from '../ripples.actions'

const positionService: PositionService = new PositionService()

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
  measurePath: [],
  annotations: [],
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
  [setCcus.type]: (state, action) => {
    state.assets.ccus = action.payload
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
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
    if (plan) {
      const wp = plan.waypoints[state.selectedWaypointIdx]
      wp.latitude = newLocation.latitude
      wp.longitude = newLocation.longitude
      positionService.updateWaypointsTimestampFromIndex(plan.waypoints, state.selectedWaypointIdx)
    }
  },
  [updateWpTimestamp.type]: (state, action) => {
    const { timestamp, wpIndex } = action.payload
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
    if (plan) {
      const wp = plan.waypoints[wpIndex]
      wp.timestamp = timestamp
      positionService.updateWaypointsTimestampFromIndex(plan.waypoints, wpIndex + 1)
    }
  },
  [deleteWp.type]: (state, action) => {
    const markerIdx = action.payload
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
    if (!plan) {
      return
    }
    plan.waypoints.splice(markerIdx, 1)
    positionService.updateWaypointsTimestampFromIndex(plan.waypoints, markerIdx)
  },
  [addWpToPlan.type]: (state, action) => {
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
    if (plan) {
      plan.waypoints.push(action.payload)
      positionService.updateWaypointsTimestampFromIndex(plan.waypoints, plan.waypoints.length - 1)
    }
  },
  [cancelEditPlan.type]: (state, _) => {
    state.planSet = JSON.parse(JSON.stringify(state.previousPlanSet))
    state.previousPlanSet = []
    state.selectedPlan = EmptyPlan
  },
  [updatePlanId.type]: (state, action) => {
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
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
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
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
    const plan = state.planSet.find(p => isPlanEqual(p, state.selectedPlan))
    if (plan) {
      plan.waypoints = plan.waypoints.map(wp => Object.assign({}, wp, { timestamp: 0 }))
    }
  },
  [togglePlanVisibility.type]: (state, action) => {
    const payloadPlan: IPlan = action.payload
    const plan = state.planSet.find(p => isPlanEqual(p, payloadPlan))
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
  [updateCCU.type]: (state, action) => {
    const newCCU: IAsset = action.payload
    const oldAsset = state.assets.ccus.find(c => c.name === newCCU.name)
    if (oldAsset) {
      oldAsset.lastState = newCCU.lastState
    } else {
      state.assets.ccus.push(newCCU)
    }
  },
  [updateSpot.type]: (state, action) => {
    const newSpot: IAsset = action.payload
    const oldAsset = state.assets.spots.find(s => s.name === newSpot.name)
    if (oldAsset) {
      oldAsset.lastState = newSpot.lastState
    } else {
      state.assets.spots.push(newSpot)
    }
  },
  [updatePlan.type]: (state, action) => {
    const newPlan: IPlan = action.payload
    const oldPlan = state.planSet.find(p => isPlanEqual(p, newPlan))
    if (oldPlan) {
      oldPlan.assignedTo = newPlan.assignedTo
      oldPlan.waypoints = newPlan.waypoints
    } else {
      state.planSet.push(newPlan)
    }
  },
  [updateAIS.type]: (state, action) => {
    const newAIS: IAisShip = action.payload
    const oldAIS = state.assets.aisShips.find(s => s.mmsi === newAIS.mmsi)
    if (oldAIS) {
      oldAIS.awareness = newAIS.awareness
      oldAIS.dest = newAIS.dest
      oldAIS.eta = newAIS.eta
      oldAIS.heading = newAIS.heading
      oldAIS.latitude = newAIS.latitude
      oldAIS.longitude = newAIS.longitude
      oldAIS.sog = newAIS.sog
      oldAIS.timestamp = newAIS.timestamp
      oldAIS.location = newAIS.location
    } else {
      state.assets.aisShips.push(newAIS)
    }
  },
  [addMeasurePoint.type]: (state, action) => {
    const newPoint: ILatLng = action.payload
    state.measurePath.push(newPoint)
  },
  [clearMeasure.type]: (state, _) => {
    state.measurePath = []
  },
  [setAnnotations.type]: (state, action) => {
    state.annotations = action.payload
  },
  [addAnnotation.type]: (state, action) => {
    state.annotations.push(action.payload)
  },
})

export default ripplesReducer
