import { createAction } from '@reduxjs/toolkit'

export const setUser = createAction('SET_USER')
export const removeUser = createAction('REMOVE_USER')
export const setVehicles = createAction('SET_VEHICLES')
export const setSpots = createAction('SET_SPOTS')
export const setAis = createAction('SET_AIS')
export const setCcus = createAction('SET_CCUS')
export const setPlans = createAction('SET_PLANS')
export const removePlan = createAction('REMOVE_PLAN')
export const deleteWp = createAction('DELETE_WP')
export const updateWp = createAction('UPDATE_WP')
export const updateWpLocation = createAction('UPDATE_WP_LOCATION')
export const updateWpTimestamp = createAction('UPDATE_WP_TIMESTAMP')
export const updatePlanId = createAction('UPDATE_PLAN_ID')
export const addWpToPlan = createAction('ADD_WP_TO_PLAN')
export const editPlan = createAction('EDIT_PLAN')
export const cancelEditPlan = createAction('CANCEL_EDIT_PLAN')
export const addNewPlan = createAction('ADD_NEW_PLAN')
export const savePlan = createAction('SAVE_PLAN')
export const deleteSelectedPlan = createAction('DELETE_SELECTED_PLAN')
export const setProfiles = createAction('SET_PROFILES')
export const setSlider = createAction('SET_SLIDER')
export const setSelectedWaypointIdx = createAction('SET_SELECTED_WAYPOINT')
export const setToolSelected = createAction('SET_TOOL_SELECTED')
export const selectVehicle = createAction('SELECT_VEHICLE')
export const selectVehicleLastState = createAction('SELECT_VEHILCE_LAST_STATE')
export const selectPlanPosition = createAction('SELECT_PLAN_POSITION')
export const setPlanDescription = createAction('SET_PLAN_DESCRIPTION')
export const setSidePanelTitle = createAction('SET_SIDE_PANEL_TITLE')
export const setSidePanelContent = createAction('SET_SIDE_PANEL_CONTENT')
export const setSidePanelVisibility = createAction('SET_SIDE_PANEL_VISIBILITY')
export const togglePlanVisibility = createAction('TOGGLE_PLAN_VISIBILITY')
export const unschedulePlan = createAction('UNSCHEDULE_PLAN')
export const updateVehicle = createAction('UPDATE_VEHICLE')
export const updatePlan = createAction('UPDATE_PLAN')
export const updateSpot = createAction('UPDATE_SPOT')
export const updateCCU = createAction('UPDATE_CCU')
export const updateAIS = createAction('UPDATE_AIS')
export const addMeasurePoint = createAction('ADD_MEASURE_POINT')
export const removeMeasurePoint = createAction('REMOVE_MEASURE_POINT')
export const clearMeasure = createAction('CLEAR_MEASURE')
export const setAnnotations = createAction('SET_ANNOTATIONS')
export const addAnnotation = createAction('ADD_ANNOTATION')
export const updateUserLocation = createAction('UPDATE_USER_LOCATION')
export const toggleGps = createAction('TOGGLE_GPS')
export const toggleVehicleModal = createAction('TOGGLE_VEHICLE_MODAL')
export const setEditVehicle = createAction('SET_EDIT_VEHICLE')
export const toggleSliderChange = createAction('TOGGLE_SLIDER_CHANGE')
export const toggleSlider = createAction('TOGGLE_SLIDER')
export const setMapOverlayInfo = createAction('SET_MAP_OVERLAY_INFO')
export const setWeatherParam = createAction('SET_WEATHER_PARAM')
export const setToolClickLocation = createAction('SET_TOOL_CLICK_LOCATION')
export const removeGeoLayers = createAction('REMOVE_GEO_LAYERS')
export const setGeoLayers = createAction('SET_GEO_LAYERS')
export const setEditingPlan = createAction('SET_IS_EDITING_PLAN')
export const setUpdatingPlanId = createAction('SET_UPDATING_PLAN_ID')
export const setPollution = createAction('SET_POLLUTION')
export const updatePollution = createAction('UPDATE_POLLUTION')
export const setObstacle = createAction('SET_OBSTACLE')
export const updateObstacle = createAction('UPDATE_OBSTACLE')
