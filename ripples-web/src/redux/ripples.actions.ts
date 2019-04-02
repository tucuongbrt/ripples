import { createAction } from 'redux-starter-kit'

export const setUser = createAction('SET_USER')
export const removeUser = createAction('REMOVE_USER')
export const setVehicles = createAction('SET_VEHICLES')
export const setVehicle = createAction('SET_VEHICLE')
export const setSpots = createAction('SET_SPOTS')
export const setAis = createAction('SET_AIS')
export const editPlan = createAction('EDIT_PLAN')
export const cancelEditPlan = createAction('CANCEL_EDIT_PLAN')
export const setSlider = createAction('SET_SLIDER')
export const setSelectedWaypoint = createAction('SET_SELECTED_WAYPOINT')
