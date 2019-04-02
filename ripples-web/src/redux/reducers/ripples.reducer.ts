import { createReducer, createAction } from 'redux-starter-kit'
import { setUser, removeUser, setVehicles, setAis, setSpots, editPlan, setSlider, cancelEditPlan, setSelectedWaypoint, setVehicle } from '../ripples.actions'
import IRipplesState, { defaultAssetsGroup } from '../../model/IRipplesState'
import {noAuth} from '../../model/IAuthState';
import IAsset, { EmptyAsset } from '../../model/IAsset';

let startState: IRipplesState = {
  assets: defaultAssetsGroup,
  selectedVehicle: EmptyAsset,
  sliderValue: 0,
  selectedWaypointIdx: -1,
  auth: noAuth
}

const ripplesReducer = createReducer(startState, {
  [setUser.type]: (state, action) => {
    console.log('Called Set user reducer with action: ', action)
    state.auth.currentUser = action.payload;
    state.auth.authenticated = true;
  },
  [removeUser.type]: (state, action) => {
    state.auth = noAuth;
  },
  [setVehicles.type]: (state, action) => {
    state.assets.vehicles = action.payload;
  },
  [setVehicle.type]: (state, action) => {
    const vehicle: IAsset = action.payload;
    const idx = state.assets.vehicles.findIndex(v => v.imcid == vehicle.imcid)
    state.assets.vehicles[idx] = vehicle;
  },
  [setSpots.type]: (state, action) => {
    state.assets.spots = action.payload;
  },
  [setAis.type]: (state, action) => {
    state.assets.aisShips = action.payload;
  },
  [editPlan.type]: (state, action) => {
    state.selectedVehicle = action.payload
    state.assets.previousVehicles = JSON.parse(JSON.stringify(state.assets.vehicles))
  },
  [cancelEditPlan.type]: (state, action) => {
    state.assets.vehicles = JSON.parse(JSON.stringify(state.assets.previousVehicles))
    state.assets.previousVehicles = []
    state.selectedVehicle = EmptyAsset
  },
  [setSlider.type]: (state, action) => {
    state.sliderValue = action.payload
  },
  [setSelectedWaypoint.type]: (state, action) => {
    state.selectedWaypointIdx = action.payload
  }
})

export default ripplesReducer