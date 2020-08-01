import React, { Component } from 'react'
import { FeatureGroup, Popup, Marker } from 'react-leaflet'
// @ts-ignore
import { EditControl } from 'react-leaflet-draw'
import { WaypointIcon } from './Icons'
import L from 'leaflet'
import DateService from '../../../services/DateUtils'
import IPositionAtTime, { ILatLngAtTime } from '../../../model/IPositionAtTime'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import {
  setSidePanelTitle,
  setSidePanelContent,
  setSidePanelVisibility,
  setEditVehicle,
  addNewPlan,
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
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
  addNewPlan: (plan: IPlan) => void
}

interface StateType {
  collection: any
  plansWp: ILatLngAtTime[][]
  onEditMode: boolean
  loadedPlans: boolean
}

/**
 * Polygon editor template snippet
 * adapted from https://github.com/alex3165/react-leaflet-draw
 */
class PolygonEditor extends Component<PropsType, StateType> {
  private posService: PositionService = new PositionService()
  private soiService: SoiService = new SoiService()
  private _editableFG = null

  public constructor(props: any) {
    super(props)
    this.state = {
      collection: null,
      plansWp: [],
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
    if (prevProps.plans !== plans) {
      this.updateReceivedPlans(plans)
    }
  }

  updateReceivedPlans = (plans: IPlan[]) => {
    const { plansWp } = this.state

    if (!plans) return

    const collection: any = {
      name: 'Plans',
      type: 'FeatureCollection',
      features: [],
    }

    plans.forEach((p: IPlan) => {
      const plan: any = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      }
      const wps = p.waypoints
      wps.forEach((wp: IPositionAtTime) => {
        // Save plan geometric properties for layer drawing
        const coordinates = [wp.longitude, wp.latitude]
        plan.geometry.coordinates.push(coordinates)
        // Save waypoints
        const pos: ILatLngAtTime = {
          lat: wp.latitude,
          lng: wp.longitude,
          timestamp: 0,
        }
        plansWp.push([pos])
      })

      // Save feature on collection
      collection.features.push(plan)
    })

    // Store waypoints
    this.setState({
      collection,
      plansWp,
    })
  }

  _onEdited = (e: any) => {
    let numEdited = 0
    e.layers.eachLayer(() => {
      numEdited += 1
    })
    console.log(`_onEdited: edited ${numEdited} layers`, e)

    this._onChange()
  }

  _onCreated = (e: any) => {
    const { getPosAtTime } = this.posService
    const { plansWp } = this.state

    let waypoints: any = []

    switch (e.layerType) {
      case 'polyline':
        waypoints = getPosAtTime(e.layer._latlngs)
        console.log('_onCreated: polyline created:')
        break
      case 'rectangle':
      case 'polygon':
        waypoints = getPosAtTime(e.layer._latlngs[0])
        console.log('_onCreated: polygon created', e)
        break
      default:
        console.log(e)
        break
    }

    // Store polygon waypoints
    this.setState({
      plansWp: [...plansWp, waypoints],
    })

    // Store plan
    this.insertPlan(waypoints)

    this._onChange()
  }

  _onDeleted = (e: any) => {
    let numDeleted = 0
    e.layers.eachLayer(() => {
      numDeleted += 1
    })
    console.log(`onDeleted: removed ${numDeleted} layers`, e)

    this.handleDeletePlans()

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
    console.log('_onDeleteStart', e)
  }

  _onDeleteStop = (e: any) => {
    console.log('_onDeleteStop', e)
  }

  _onFeatureGroupReady = (reactFGref: any) => {
    const { collection, loadedPlans } = this.state

    if (!reactFGref || !collection || loadedPlans) return

    // populate FeatureGroup with the existent plans
    const leafletGeoJSON = new L.GeoJSON(collection)
    const leafletFG = reactFGref.leafletElement

    leafletGeoJSON.eachLayer((layer) => {
      leafletFG.addLayer(layer)
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

  handleMarkerClick(i: number): any {
    const { setSidePanelTitle, setSidePanelVisibility, setEditVehicle } = this.props
    setSidePanelTitle(`Waypoint ${i} of plano_teste`)
    // setSidePanelContent(this.getWaypointSidePanelProperties(plan.waypoints[i]))
    setSidePanelVisibility(true)
    setEditVehicle(undefined)
  }

  buildWaypoints = (polygon: ILatLngAtTime[]) => {
    const icon = new WaypointIcon()
    return polygon.map((p, i) => (
      <Marker
        key={'Waypoint' + i + '_' + i}
        index={i}
        position={p}
        icon={icon}
        onClick={() => this.handleMarkerClick(i)}
      >
        <Popup minWidth={300} maxWidth={600}>
          asda
        </Popup>
      </Marker>
    ))
  }

  getWaypointSidePanelProperties(wp: IPositionAtTime) {
    return {
      eta: wp.timestamp ? DateService.timeFromNow(wp.timestamp) : 'N/D',
      'exact eta': wp.timestamp ? DateService.timestampMsToReadableDate(wp.timestamp) : 'N/D',
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
    }
  }

  insertPlan = (waypoints: ILatLngAtTime[]) => {
    const { currentUser, addNewPlan } = this.props
    const { getILatLngFromArray } = this.posService

    const wps = getILatLngFromArray(waypoints)
    const planId = `${currentUser.name}-${DateService.idfromDate(new Date())}`

    const plan: IPlan = {
      assignedTo: '',
      description: `Plan created by ${currentUser.email} on ${DateService.timestampMsToReadableDate(Date.now())}`,
      id: planId,
      waypoints: wps,
      visible: true,
      type: 'backseat',
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

  async handleDeletePlans() {
    const { plans } = this.props

    plans.forEach(async (p) => {
      try {
        await this.soiService.deleteUnassignedPlan(p.id)
      } catch (error) {
        NotificationManager.warning(error.message)
      }
    })
    NotificationManager.success(`All plans have been deleted`)
  }

  render() {
    const { plansWp, onEditMode } = this.state
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
        {!onEditMode && plansWp.map((p: ILatLngAtTime[]) => this.buildWaypoints(p))}
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
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

export default connect(mapStateToProps, actionCreators)(PolygonEditor)
