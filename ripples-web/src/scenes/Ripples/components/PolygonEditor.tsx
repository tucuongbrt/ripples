import React, { Component } from 'react'
import { FeatureGroup, Marker, Popup } from 'react-leaflet'
// @ts-ignore
import { EditControl } from 'react-leaflet-draw'
import { WaypointIcon, StartWaypointIcon, FinishWaypointIcon } from './Icons'
import L, { Layer } from 'leaflet'
// @ts-ignore
import 'leaflet-draw'
import DateService from '../../../services/DateUtils'
import IPositionAtTime, { ILatLngAtTime, ILatLngs, IVehicleAtTime } from '../../../model/IPositionAtTime'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import {
  addNewPlan,
  removePlan,
  setEditVehicle,
  setSelectedWaypointIdx,
  setSidePanelTitle,
  setSidePanelContent,
  setSidePanelVisibility,
  updatePlan,
  updateWp,
  updateWpLocation,
  updateWpTimestamp,
} from '../../../redux/ripples.actions'
import IPlan from '../../../model/IPlan'
import PositionService from '../../../services/PositionUtils'
import IRipplesState from '../../../model/IRipplesState'
import { IUser } from '../../../model/IAuthState'
import SoiService from '../../../services/SoiUtils'
import { ToolSelected } from '../../../model/ToolSelected'
import DatePicker from 'react-datepicker'
import { FormGroup, Label, Input } from 'reactstrap'
import ILatLng from '../../../model/ILatLng'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  mapRef: any
  currentUser: IUser
  plans: IPlan[]
  selectedPlan: IPlan
  toolSelected: ToolSelected
  isEditingPlan: boolean
  selectedWaypointIdx: number
  addNewPlan: (plan: IPlan) => void
  removePlan: (planId: string) => void
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
  setSelectedWaypointIdx: (_: number) => void
  updatePlan: (plan: IPlan) => void
  updateWp: (wp: IPositionAtTime) => void
  updateWpLocation: (_: ILatLng) => void
  updateWpTimestamp: (_: any) => void
}

interface StateType {
  collection: any
  currentPlanId: string
  onEditMode: boolean
  loadedPlans: boolean
}

interface PlanProperties {
  length: number
  area: number
}

/**
 * Polygon editor template snippet
 * adapted from https://github.com/alex3165/react-leaflet-draw
 */
class PolygonEditor extends Component<PropsType, StateType> {
  private posService: PositionService = new PositionService()
  private soiService: SoiService = new SoiService()
  private planProperties = new Map<string, PlanProperties>()
  private _editableFG = null

  public constructor(props: any) {
    super(props)
    this.state = {
      collection: null,
      currentPlanId: '',
      onEditMode: false,
      loadedPlans: false,
    }
  }

  static polygonOptions = {
    icon: new WaypointIcon(),
    allowIntersection: false,
    showArea: true,
    showLength: true,
    showRadius: true,
    metric: ['km', 'm'],
    shapeOptions: {
      stroke: true,
      color: '#000080',
      weight: 4,
      opacity: 1,
      fill: false,
      clickable: false,
    },
  }

  componentDidUpdate(prevProps: PropsType) {
    const { plans } = this.props
    const { loadedPlans } = this.state
    if (prevProps.plans !== plans && !loadedPlans) {
      this.updateReceivedPlans(plans)
    }
  }

  updateReceivedPlans = (plans: IPlan[]) => {
    if (!plans) return

    const collection: any = {
      name: 'Plans',
      type: 'FeatureCollection',
      features: [],
    }

    plans.forEach((p: IPlan) => {
      const plan: any = {
        type: 'Feature',
        properties: {
          id: p.id,
        },
        geometry: {
          type: p.survey ? 'Polygon' : 'LineString',
          coordinates: p.survey ? [[]] : [],
        },
      }
      const wps = p.waypoints
      wps.forEach((wp: IPositionAtTime) => {
        // Save plan geometric properties for layer drawing
        const coordinates = [wp.longitude, wp.latitude]
        if (p.survey) {
          plan.geometry.coordinates[0].push(coordinates)
        } else {
          plan.geometry.coordinates.push(coordinates)
        }
      })
      // Save plan area / length properties
      const latlngs = this.posService.getLatLngFromArray(wps)
      this.savePlanProperties(p.id, latlngs, p.survey)
      // Save feature on collection
      collection.features.push(plan)
    })
    // Store waypoints
    this.setState({ collection })
  }

  getLayerById(id: string) {
    // @ts-ignore
    const { _layers } = this._editableFG.leafletElement
    return Object.values(_layers).find((layer: any) => layer.options.id === id)
  }

  seedPlanId() {
    const { currentUser } = this.props
    const currentDate = DateService.idfromDate(new Date())
    const planId = `${currentUser.name}-${currentDate}`
    this.setState({
      currentPlanId: planId,
    })
  }

  _onEdited = (e: any) => {
    const { plans } = this.props
    const { getILatLngFromArray } = this.posService

    const editedPlans: IPlan[] = []
    e.layers.eachLayer((layer: any) => {
      // Find current plan
      const plan: IPlan | undefined = plans.find((p) => p.id === layer.options.id)
      if (!plan) return

      // Update plan waypoint coordinates
      const planCopy = JSON.parse(JSON.stringify(plan))
      const coordinates = plan.survey ? layer._latlngs[0] : layer._latlngs
      planCopy.waypoints = getILatLngFromArray(coordinates)

      editedPlans.push(planCopy)
    })

    this.handleEditPlan(editedPlans)

    console.log(`_onEdited: edited ${editedPlans.length} layers`, e)

    this._onChange()
  }

  _onCreated = (e: any) => {
    // Generate new plan ID
    this.seedPlanId()

    const { currentPlanId } = this.state
    const { getPosAtTime } = this.posService

    let waypoints: any = []
    let isSurvey = false

    // Layer's plan ID
    e.layer.options.id = currentPlanId
    console.log(e.layer)

    // Plan waypoints and properties
    let latLngs: ILatLngs[] = []

    switch (e.layerType) {
      case 'polyline':
        // Calculate waypoints
        latLngs = e.layer._latlngs
        waypoints = getPosAtTime(latLngs)
        console.log('_onCreated: polyline created:')
        break
      case 'rectangle':
      case 'polygon':
        isSurvey = true
        // Calculate waypoints
        latLngs = e.layer._latlngs[0]
        waypoints = getPosAtTime(latLngs)
        // Closing the polygon by repeating the first waypoint
        waypoints.push(waypoints[0])
        console.log('_onCreated: polygon created', e)
        break
      default:
        console.log(e)
        break
    }

    // Save geodesic area and length
    this.savePlanProperties(currentPlanId, latLngs, isSurvey)

    // Show plan properties
    this.bindPopupToPlan(e.layer, currentPlanId)

    // Focus on created plan
    this.focusOnPlan(e.layer.getBounds())

    // Store plan
    this.insertPlan(waypoints, isSurvey)

    this._onChange()
  }

  _onDeleted = (e: any) => {
    const deletedLayers: string[] = []
    e.layers.eachLayer((layer: any) => {
      deletedLayers.push(layer.options.id)
    })

    this.handleDeletePlans(deletedLayers)
    console.log(`onDeleted: removed ${deletedLayers.length} layers`, e)

    this._onChange()
  }

  _onMounted = (drawControl: any) => {
    console.log('_onMounted', drawControl)
  }

  _onEditStart = (e: any) => {
    this.setState({ onEditMode: true })
    console.log('_onEditStart', e)
  }

  _onEditStop = (e: any) => {
    this.setState({ onEditMode: false })
    console.log('_onEditStop', e)
  }

  _onDeleteStart = (e: any) => {
    this.setState({ onEditMode: true })
    console.log('_onDeleteStart', e)
  }

  _onDeleteStop = (e: any) => {
    this.setState({ onEditMode: false })
    console.log('_onDeleteStop', e)
  }

  _onFeatureGroupReady = (reactFGref: any) => {
    const { collection, loadedPlans } = this.state

    if (!reactFGref || !collection || loadedPlans) return

    // populate FeatureGroup with the existent plans
    const leafletGeoJSON = new L.GeoJSON(collection)
    const leafletFG = reactFGref.leafletElement

    // Shape options
    const { shapeOptions } = PolygonEditor.polygonOptions

    leafletGeoJSON.eachLayer((layer: any) => {
      // Override layer drawing properties
      layer.options.id = layer.feature.properties.id
      layer.options.color = shapeOptions.color
      // Add layer to FeatureGroup
      leafletFG.addLayer(layer)
      // Show plan properties
      this.bindPopupToPlan(layer, layer.options.id)
    })

    this._editableFG = reactFGref

    this.setState({ loadedPlans: true })
  }

  _onChange = () => {
    if (this._editableFG) {
      // @ts-ignore
      const geojsonData = this._editableFG.leafletElement.toGeoJSON()
      console.log('geojson changed', geojsonData)
    }
  }

  buildWaypoints = () => {
    const { plans } = this.props
    const { getLatLng } = this.posService

    return plans.map((plan: IPlan) => {
      const wps: IVehicleAtTime[] = plan.waypoints
      return wps.map((wp, i) => {
        const icon =
          i === 0 ? new StartWaypointIcon() : i < wps.length - 1 ? new WaypointIcon() : new FinishWaypointIcon()
        return (
          <Marker
            key={'Waypoint' + i + '_' + plan.id}
            index={i}
            position={getLatLng(wp)}
            icon={icon}
            onClick={() => this.handleMarkerClick(i, plan)}
          >
            {this.buildMarkerPopup(wp)}
          </Marker>
        )
      })
    })
  }

  buildMarkerPopup(wp: IVehicleAtTime) {
    const { isEditingPlan, selectedWaypointIdx, updateWpTimestamp } = this.props
    if (isEditingPlan) {
      return (
        <Popup className="waypoint-popup">
          <FormGroup>
            <Label for="latitude">Latitude</Label>
            <Input
              type="number"
              name="latitude"
              id="latitude"
              value={wp.latitude}
              min={-90}
              max={90}
              onChange={(e) => this.updateWaypoint(wp, 'latitude', e.target.value)}
              className="form-control form-control-sm"
            />
          </FormGroup>
          <FormGroup>
            <Label for="longitude">Longitude</Label>
            <Input
              type="number"
              name="longitude"
              id="longitude"
              min={-180}
              max={180}
              value={wp.longitude}
              onChange={(e) => this.updateWaypoint(wp, 'longitude', e.target.value)}
              className="form-control form-control-sm"
            />
          </FormGroup>
          <FormGroup>
            <Label for="depth">Depth (m)</Label>
            <Input
              type="number"
              name="depth"
              id="depth"
              min={0}
              value={wp.depth}
              onChange={(e) => this.updateWaypoint(wp, 'depth', e.target.value)}
              className="form-control form-control-sm"
            />
          </FormGroup>
          <FormGroup>
            <Label for="timestamp">Timestamp</Label>
            <div className="date-picker-control">
              <DatePicker
                selected={wp.timestamp === 0 ? new Date() : new Date(wp.timestamp)}
                onChange={(newDate: any) => this.updateWaypoint(wp, 'timestamp', newDate)}
                showTimeSelect={true}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yy, h:mm aa"
                timeCaption="time"
                className="form-control form-control-sm"
              />
              <i
                className="far fa-times-circle fa-lg"
                onClick={() => updateWpTimestamp({ timestamp: 0, wpIndex: selectedWaypointIdx })}
              />
            </div>
          </FormGroup>
        </Popup>
      )
    }
  }

  updateWaypoint(wp: IVehicleAtTime, property: string, value: any) {
    const { updateWp } = this.props

    const newWp = Object.assign({}, wp)
    switch (property) {
      case 'latitude':
        newWp.latitude = value
        break
      case 'longitude':
        newWp.longitude = value
        break
      case 'depth':
        newWp.depth = parseFloat(value)
        break
      case 'timestamp':
        if (value instanceof Date) {
          newWp.timestamp = value.getTime()
        }
        break
      default:
        break
    }

    updateWp(newWp)

    // Update layer drawing positions
    this.updateLayerPositions(newWp)
  }

  updateLayerPositions(wp: IPositionAtTime) {
    const { selectedPlan, selectedWaypointIdx } = this.props
    // @ts-ignore
    const layer: any = this.getLayerById(selectedPlan.id)
    if (!layer) return
    const coords = selectedPlan.survey ? layer._latlngs[0] : layer._latlngs
    coords[selectedWaypointIdx] = {
      lat: wp.latitude,
      lng: wp.longitude,
    }
    if (selectedPlan.survey) {
      // If start / finish waypoint changed, update each other
      if (selectedWaypointIdx === 0) {
        coords[coords.length - 1] = coords[0]
        layer.feature.geometry.coordinates[0][coords.length - 1] = coords[0]
      } else if (selectedWaypointIdx === coords.length - 1) {
        coords[0] = coords[coords.length - 1]
      }
    }
    console.log(layer)
  }

  handleMarkerClick(i: number, plan: IPlan): any {
    const {
      isEditingPlan,
      setSelectedWaypointIdx,
      setSidePanelTitle,
      setSidePanelContent,
      setSidePanelVisibility,
      setEditVehicle,
    } = this.props

    // Select waypoint
    setSelectedWaypointIdx(i)

    if (!isEditingPlan) {
      setSidePanelTitle(`Waypoint ${i} of ${plan.id}`)
      setSidePanelContent(this.getWaypointSidePanelProperties(plan.waypoints[i]))
      setSidePanelVisibility(true)
      setEditVehicle(undefined)
    }
  }

  getWaypointSidePanelProperties(wp: IVehicleAtTime) {
    return {
      eta: wp.timestamp ? DateService.timeFromNow(wp.timestamp) : 'N/D',
      'exact eta': wp.timestamp ? DateService.timestampMsToReadableDate(wp.timestamp) : 'N/D',
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
      'depth (m)': wp.depth.toFixed(5),
    }
  }

  bindPopupToPlan(layer: Layer, planId: string) {
    const properties = this.planProperties.get(planId)
    if (!properties) return
    // @ts-ignore
    const length = L.GeometryUtil.readableDistance(properties.length, true, false, false, 2)
    // @ts-ignore
    const area = L.GeometryUtil.readableArea(properties.area, ['km'], 2)
    let msg = `<strong>${planId}</strong><div><strong>Length:</strong> ${length}</div>`
    if (properties.area > 0) msg += `<div><strong>Area:</strong> ${area}</div>`
    layer.bindPopup(msg)
  }

  savePlanProperties(planId: string, waypoints: ILatLngs[], isSurvey: boolean) {
    // Plan coverage area
    // @ts-ignore
    const area = isSurvey ? L.GeometryUtil.geodesicArea(waypoints) : 0

    // Path full length
    const wps = this.posService.getPositionsFromArray(waypoints)
    const length = this.posService.measureTotalDistance(wps)

    this.planProperties.set(planId, {
      area,
      length,
    })
  }

  insertPlan = (waypoints: ILatLngAtTime[], isSurvey: boolean) => {
    const { currentPlanId } = this.state
    const { currentUser, addNewPlan } = this.props
    const { getILatLngFromArray } = this.posService

    const date = DateService.timestampMsToReadableDate(Date.now())
    const wps: IVehicleAtTime[] = getILatLngFromArray(waypoints)

    const plan: IPlan = {
      assignedTo: '',
      description: `Plan created by ${currentUser.email} on ${date}`,
      id: currentPlanId,
      waypoints: wps,
      visible: true,
      type: 'backseat',
      survey: isSurvey,
    }

    // Store to redux
    addNewPlan(plan)
    // Store to server
    this.handleSavePlan(plan)
  }

  async handleSavePlan(plan: IPlan) {
    try {
      const response = await this.soiService.sendUnassignedPlan(plan)
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.warning(error.message)
    }
  }

  async handleDeletePlan(planId: string) {
    try {
      await this.soiService.deleteUnassignedPlan(planId)
      NotificationManager.success(`Plan ${planId} has been deleted`)
    } catch (error) {
      NotificationManager.warning(error.message)
    }
  }

  async handleDeletePlans(planIds: string[]) {
    const { removePlan } = this.props

    if (planIds.length === 0) return

    let errorOccurred = false
    planIds.forEach(async (planId: string) => {
      try {
        removePlan(planId)
        await this.soiService.deleteUnassignedPlan(planId)
      } catch (error) {
        errorOccurred = true
      }
    })

    errorOccurred
      ? NotificationManager.warning('Some plans could not be deleted!')
      : planIds.length > 1
      ? NotificationManager.success(`Selected plans have been deleted`)
      : NotificationManager.success(`Plan of id ${planIds[0]} has been deleted`)
  }

  async handleEditPlan(plans: IPlan[]) {
    const { updatePlan } = this.props

    if (plans.length === 0) return

    let errorOccurred = false
    plans.forEach(async (plan: IPlan) => {
      try {
        updatePlan(plan)
        await this.soiService.sendUnassignedPlan(plan)
      } catch (error) {
        errorOccurred = true
      }
    })

    errorOccurred
      ? NotificationManager.warning('Some plans could not be edited!')
      : plans.length > 1
      ? NotificationManager.success(`Selected plans have been edited`)
      : NotificationManager.success(`Plan of id ${plans[0].id} has been edited`)
  }

  focusOnPlan(layerBounds: any) {
    const { mapRef } = this.props
    mapRef.leafletElement.fitBounds(layerBounds)
  }

  render() {
    const { onEditMode } = this.state
    return (
      <FeatureGroup
        ref={(reactFGref) => {
          this._onFeatureGroupReady(reactFGref)
        }}
      >
        <EditControl
          position="topleft"
          onEdited={this._onEdited}
          onCreated={this._onCreated}
          onDeleted={this._onDeleted}
          onMounted={this._onMounted}
          onEditStart={this._onEditStart}
          onEditStop={this._onEditStop}
          onDeleteStart={this._onDeleteStart}
          onDeleteStop={this._onDeleteStop}
          draw={{
            polyline: PolygonEditor.polygonOptions,
            rectangle: PolygonEditor.polygonOptions,
            polygon: PolygonEditor.polygonOptions,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            allowIntersection: false,
            featureGroup: this._editableFG,
          }}
        />
        {!onEditMode && this.buildWaypoints()}
      </FeatureGroup>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    currentUser: state.auth.currentUser,
    plans: state.planSet,
    selectedPlan: state.selectedPlan,
    toolSelected: state.toolSelected,
    isEditingPlan: state.isEditingPlan,
    selectedWaypointIdx: state.selectedWaypointIdx,
  }
}

const actionCreators = {
  addNewPlan,
  updatePlan,
  removePlan,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
  updateWp,
  updateWpLocation,
  updateWpTimestamp,
}

export default connect(mapStateToProps, actionCreators)(PolygonEditor)
