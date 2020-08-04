import React, { Component } from 'react'
import { FeatureGroup, Marker } from 'react-leaflet'
// @ts-ignore
import { EditControl } from 'react-leaflet-draw'
import { WaypointIcon } from './Icons'
import L, { Layer } from 'leaflet'
// @ts-ignore
import 'leaflet-draw'
import DateService from '../../../services/DateUtils'
import IPositionAtTime, { ILatLngAtTime, ILatLngs } from '../../../model/IPositionAtTime'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import {
  addNewPlan,
  removePlan,
  setEditVehicle,
  setSidePanelTitle,
  setSidePanelContent,
  setSidePanelVisibility,
  updatePlan,
} from '../../../redux/ripples.actions'
import IPlan from '../../../model/IPlan'
import PositionService from '../../../services/PositionUtils'
import IRipplesState from '../../../model/IRipplesState'
import { IUser } from '../../../model/IAuthState'
import SoiService from '../../../services/SoiUtils'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  currentUser: IUser
  plans: IPlan[]
  addNewPlan: (plan: IPlan) => void
  removePlan: (planId: string) => void
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
  updatePlan: (plan: IPlan) => void
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
      opacity: 0.8,
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
      this.savePlanProperties(p.id, latlngs)
      // Save feature on collection
      collection.features.push(plan)
    })
    // Store waypoints
    this.setState({ collection })
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
    let isPolygon = false

    // Layer's plan ID
    e.layer.options.id = currentPlanId

    // Plan waypoints and length / area properties
    switch (e.layerType) {
      case 'polyline':
        waypoints = getPosAtTime(e.layer._latlngs)
        console.log('_onCreated: polyline created:')
        break
      case 'rectangle':
      case 'polygon':
        isPolygon = true
        // Calculate waypoints
        const latLngs: ILatLngs[] = e.layer._latlngs[0]
        waypoints = getPosAtTime(latLngs)
        // Closing the polygon by repeating the first waypoint
        waypoints.push(waypoints[0])
        // Save geodesic area and length
        this.savePlanProperties(currentPlanId, latLngs)
        // Show properties
        this.bindPopupToPlan(e.layer, currentPlanId)
        console.log('_onCreated: polygon created', e)
        break
      default:
        console.log(e)
        break
    }

    // Store plan
    this.insertPlan(waypoints, isPolygon)

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

    leafletGeoJSON.eachLayer((layer: any) => {
      layer.options.id = layer.feature.properties.id
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

    return plans.map((plan) => {
      const wps = plan.waypoints
      return wps.map((pos: IPositionAtTime, i) => {
        return (
          <Marker
            key={'Waypoint' + i + '_' + plan.id}
            index={i}
            position={getLatLng(pos)}
            icon={new WaypointIcon()}
            onClick={() => this.handleMarkerClick(i, plan)}
          />
        )
      })
    })
  }

  handleMarkerClick(i: number, plan: IPlan): any {
    const { setSidePanelTitle, setSidePanelContent, setSidePanelVisibility, setEditVehicle } = this.props
    setSidePanelTitle(`Waypoint ${i} of ${plan.id}`)
    setSidePanelContent(this.getWaypointSidePanelProperties(plan.waypoints[i]))
    setSidePanelVisibility(true)
    setEditVehicle(undefined)
  }

  getWaypointSidePanelProperties(wp: IPositionAtTime) {
    return {
      eta: wp.timestamp ? DateService.timeFromNow(wp.timestamp) : 'N/D',
      'exact eta': wp.timestamp ? DateService.timestampMsToReadableDate(wp.timestamp) : 'N/D',
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
    }
  }

  bindPopupToPlan(layer: Layer, planId: string) {
    const properties = this.planProperties.get(planId)
    if (!properties) return
    // @ts-ignore
    const length = L.GeometryUtil.readableDistance(properties.length, true, false, false, 2)
    // @ts-ignore
    const area = L.GeometryUtil.readableArea(properties.area, ['km'], 2)
    const msg =
      `<strong>${planId}</strong>` +
      `<div><strong>Length:</strong> ${length}</div>` +
      `<div><strong>Area:</strong> ${area}</div>`
    layer.bindPopup(msg)
  }

  savePlanProperties(planId: string, waypoints: ILatLngs[]) {
    // Plan coverage area
    // @ts-ignore
    const area = L.GeometryUtil.geodesicArea(waypoints)

    // Path full length
    const wps = this.posService.getPositionsFromArray(waypoints)
    const length = this.posService.measureTotalDistance(wps)

    this.planProperties.set(planId, {
      area,
      length,
    })
  }

  insertPlan = (waypoints: ILatLngAtTime[], isPolygon: boolean) => {
    const { currentPlanId } = this.state
    const { currentUser, addNewPlan } = this.props
    const { getILatLngFromArray } = this.posService

    const date = DateService.timestampMsToReadableDate(Date.now())
    const wps = getILatLngFromArray(waypoints)

    const plan: IPlan = {
      assignedTo: '',
      description: `Plan created by ${currentUser.email} on ${date}`,
      id: currentPlanId,
      waypoints: wps,
      visible: true,
      type: 'backseat',
      survey: isPolygon,
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
            selectedPathOptions: {
              maintainColor: true,
              fillOpacity: 0.3,
            },
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
  }
}

const actionCreators = {
  addNewPlan,
  updatePlan,
  removePlan,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

export default connect(mapStateToProps, actionCreators)(PolygonEditor)
