import { createReducer, createAction } from 'redux-starter-kit'
import { setUser, removeUser, setVehicles } from '../ripples.actions'
import IRipplesState from '../../model/IRipplesState'
import {noAuth} from '../../model/IAuthState';



let startState: IRipplesState = {
  vehiclePlanPairs: [],
  vehicles: [],
  previousVehicles: [],
  spots: [],
  profiles: [],
  aisShips: [],
  selectedPlan: '',
  freeDrawPolygon: [],
  sidebarOpen: true,
  soiAwareness: [],
  aisAwareness: [],
  sliderValue: 0,
  drawAwareness: false,
  wpSelected: -1,
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
    state.vehicles = action.payload;
  }
})

export default ripplesReducer