import React, { Component } from 'react'
import {
  Circle,
  GeoJSON,
  LayerGroup,
  LayersControl,
  Map as LeafletMap,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  WMSTileLayer,
} from 'react-leaflet'
import 'react-leaflet-fullscreen-control'
import { connect } from 'react-redux'
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledDropdown,
} from 'reactstrap'
import IAisShip, { IShipLocation } from '../../../model/IAisShip'
import IAnnotation, { NewAnnotation } from '../../../model/IAnnotations'
import IAsset, { isSameAsset } from '../../../model/IAsset'
import IAuthState, { isAdministrator, isScientist, isCasual, IUserLocation } from '../../../model/IAuthState'
import IGeoLayer from '../../../model/IGeoLayer'
import ILatLng from '../../../model/ILatLng'
import IMyMap, { IMapSettings } from '../../../model/IMyMap'
import IPlan from '../../../model/IPlan'
import IPositionAtTime from '../../../model/IPositionAtTime'
import IProfile from '../../../model/IProfile'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import { WeatherParam } from '../../../model/WeatherParam'
import {
  addMeasurePoint,
  removeMeasurePoint,
  addWpToPlan,
  clearMeasure,
  selectVehicleLastState,
  selectPlanPosition,
  setCcus,
  setEditVehicle,
  setMapOverlayInfo,
  setSpots,
  setVehicles,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setToolClickLocation,
  setToolSelected,
  toggleSliderChange,
  toggleVehicleModal,
  updateVehicle,
  updateWpLocation,
  toggleGps,
  setWeatherParam,
} from '../../../redux/ripples.actions'
import DateService from '../../../services/DateUtils'
import LogbookService from '../../../services/LogbookUtils'
import MapUtils from '../../../services/MapUtils'
import PositionService from '../../../services/PositionUtils'
import SoiService from '../../../services/SoiUtils'
import WeatherService, { IWeather, WeatherData, WeatherSource } from '../../../services/WeatherUtils'
import '../styles/Ripples.css'
import AISCanvas from './AISCanvas'
import AISShip from './AISShip'
import ClientLocation from './ClientLocation'
import { BlueCircleIcon, GeoJsonMarker, PCIcon, SpotIcon } from './Icons'
import SimpleAsset from './SimpleAsset'
import Vehicle from './Vehicle'
import VerticalProfile from './VerticalProfile'
import WeatherLinePlot from './WeatherLinePlot'
import PlanManager from './PlanManager'
import { fetchDomainNames } from '../../../services/DomainUtils'
import L from 'leaflet'
import IPollution from '../../../model/IPollution'
import PollutionService from '../../../services/PollutionUtils'
import Pollution from './Pollution'
import IObstacle from '../../../model/IObstacles'
import IAssetState from '../../../model/IAssetState'

const { NotificationManager } = require('react-notifications')

const CanvasLayer = require('react-leaflet-canvas-layer')
const { BaseLayer, Overlay } = LayersControl

interface PropsType {
  auth: IAuthState
  aisLocations: IShipLocation[]
  vehicles: IAsset[]
  spots: IAsset[]
  ccus: IAsset[]
  aisShips: IAisShip[]
  profiles: IProfile[]
  plans: IPlan[]
  selectedPlan: IPlan
  selectedWaypointIdx: number
  toolSelected: ToolSelected
  isGpsActive: boolean
  myMaps: IMyMap[]
  geoLayers?: IGeoLayer[] | null
  geoServerAddr?: string
  measurePath: ILatLng[]
  annotations: IAnnotation[]
  usersLocations: IUserLocation[]
  isVehicleModalOpen: boolean
  editVehicle?: IAsset
  sliderValue: number
  hasSliderChanged: boolean
  weatherParam: WeatherParam | null
  toolClickLocation: ILatLng | null
  pollution: IPollution[]
  obstacle: IObstacle[]
  vehicleSelectedLastState: IAssetState | null
  planSelectedPosition: ILatLng | null
  setSelectedWaypointIdx: (_: number) => void
  updateWpLocation: (_: ILatLng) => void
  addWpToPlan: (_: IPositionAtTime) => void
  selectVehicleLastState: (_: IAssetState | null) => void
  selectPlanPosition: (_: ILatLng | null) => void
  setVehicles: (_: IAsset[]) => void
  setSpots: (_: IAsset[]) => void
  setCcus: (_: IAsset[]) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
  addMeasurePoint: (_: ILatLng) => void
  removeMeasurePoint: (_: number) => void
  clearMeasure: () => void
  toggleVehicleModal: () => void
  setEditVehicle: (v: IAsset | undefined) => void
  updateVehicle: (v: IAsset) => void
  onSettingsClick: () => void
  toggleSliderChange: () => void
  setMapOverlayInfo: (m: string) => void
  setToolClickLocation: (l: ILatLng | null) => void
  updateAssets: (s: IAsset, d: string[]) => void
  setPollutionMarkers: () => void
  setObstacles: () => void
  setToolSelected: (_: ToolSelected) => void
  toggleGps: () => void
  setWeatherParam: (p: WeatherParam | null) => void
}

interface StateType {
  settings: IMapSettings
  isToDrawAISPolygons: boolean
  perpLinesSize: number
  currentTime: number
  isAISLayerActive: boolean
  isVehiclesLayerActive: boolean
  activeLegend: JSX.Element
  newAnnotationContent: string
  clickLocationWeather: IWeather[]
  assetSelected: IAsset | undefined
  domains: string[]

  isPollutionLayerActive: boolean
  pollutionEnable: boolean
  pollutionConfig: boolean
  editPollutionConfig: string
  pollutionDescription: string
  pollutionRadius: number
  pollutionLocation?: {
    latitude: any
    longitude: any
  }
  pollutionOpen: IPollution[]
  editPollutionMarker?: IPollution
  editObstacle?: IObstacle
  pollutionDescriptionUpdate: string
  pollutionRadiusUpdate: number
  pollutionLatitudeUpdate: number
  pollutionLongitudeUpdate: number
  isPollutionModalOpen: boolean
  isObstacleModalOpen: boolean
  isRemoveAssetModalOpen: boolean
  obstacleEnable: boolean
  obstacleDescription: string
  obstacleLocation: {
    latitude: any
    longitude: any
  }[]
  currentZoom: number
}

class RipplesMap extends Component<PropsType, StateType> {
  public upgradedOptions: any
  public initZoom = 10
  public oneSecondTimer = 0
  private map!: LeafletMap
  private positionService = new PositionService()
  private blueCircleIcon = new BlueCircleIcon()
  private logBookService = new LogbookService()
  private soiService = new SoiService()
  private weatherService = new WeatherService()
  private newAnnotationPopupRef: React.RefObject<Popup> = React.createRef()
  private vehicleChangedSettings: Map<string, string> = new Map()
  private lastWaveMapTime: string = MapUtils.resetMapTime(3)
  private lastWindMapTime: string = MapUtils.resetMapTime(6)
  private pollutionService: PollutionService = new PollutionService()

  constructor(props: PropsType) {
    super(props)

    this.state = {
      settings: {
        lat: MapUtils.initCoords.lat,
        lng: MapUtils.initCoords.lng,
        zoom: MapUtils.initZoom,
      },
      isToDrawAISPolygons: false,
      perpLinesSize: 10,
      currentTime: Date.now(),
      isAISLayerActive: true,
      isVehiclesLayerActive: true,
      activeLegend: <></>,
      newAnnotationContent: '',
      clickLocationWeather: [],
      assetSelected: undefined,
      domains: [],

      isPollutionLayerActive: false,
      pollutionEnable: false,
      pollutionConfig: false,
      editPollutionConfig: '',
      pollutionDescription: '',
      pollutionRadius: 20,
      pollutionOpen: [],
      editPollutionMarker: undefined,
      editObstacle: undefined,
      pollutionDescriptionUpdate: '',
      pollutionRadiusUpdate: 20,
      pollutionLatitudeUpdate: 0,
      pollutionLongitudeUpdate: 0,
      isPollutionModalOpen: false,
      isObstacleModalOpen: false,
      isRemoveAssetModalOpen: false,
      obstacleEnable: false,
      obstacleDescription: '',
      obstacleLocation: [],
      currentZoom: MapUtils.initZoom,
    }
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleZoom = this.handleZoom.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.drawCanvas = this.drawCanvas.bind(this)
    this.toggleDrawAisLocations = this.toggleDrawAisLocations.bind(this)
    this.onMapAnnotationClick = this.onMapAnnotationClick.bind(this)
    this.onLocationClick = this.onLocationClick.bind(this)
    this.onEditVehicle = this.onEditVehicle.bind(this)
    this.setAssetSelected = this.setAssetSelected.bind(this)
    this.handleAssetChangeDomain = this.handleAssetChangeDomain.bind(this)
    this.buildPollutionDialog = this.buildPollutionDialog.bind(this)
    this.handleChangePollutionDescription = this.handleChangePollutionDescription.bind(this)
    this.handleChangePollutionDescriptionUpdate = this.handleChangePollutionDescriptionUpdate.bind(this)
    this.handleChangePollutionRadius = this.handleChangePollutionRadius.bind(this)
    this.handleChangePollutionRadiusUpdate = this.handleChangePollutionRadiusUpdate.bind(this)
    this.handleChangePollutionLatitudeUpdate = this.handleChangePollutionLatitudeUpdate.bind(this)
    this.handleChangePollutionLongitudeUpdate = this.handleChangePollutionLongitudeUpdate.bind(this)
    this.handleChangeObstacleDescription = this.handleChangeObstacleDescription.bind(this)
    this.handleChangePollutionConfig = this.handleChangePollutionConfig.bind(this)
    this.handlePollutionEdit = this.handlePollutionEdit.bind(this)
    this.handleAddPollutionCircle = this.handleAddPollutionCircle.bind(this)
    this.handleRemovePollutionCircle = this.handleRemovePollutionCircle.bind(this)
    this.handleDeletePollution = this.handleDeletePollution.bind(this)
    this.handleDeleteObstacle = this.handleDeleteObstacle.bind(this)
    this.handleSelectedObstacle = this.handleSelectedObstacle.bind(this)
    this.togglePollutionModal = this.togglePollutionModal.bind(this)
    this.toggleObstacleModal = this.toggleObstacleModal.bind(this)
    this.toggleRemoveAssetModal = this.toggleRemoveAssetModal.bind(this)
    this.onMeasureToggle = this.onMeasureToggle.bind(this)
    this.onGpsClick = this.onGpsClick.bind(this)
    this.onAnnotationToggle = this.onAnnotationToggle.bind(this)
    this.onToolpickToogle = this.onToolpickToogle.bind(this)
    this.buildWeatherSelector = this.buildWeatherSelector.bind(this)

    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      this.fetchMapSettings()
    }

    if (this.props.auth.authenticated && isAdministrator(this.props.auth)) {
      this.getDomains()
    }
  }

  public async componentDidMount() {
    if (!this.oneSecondTimer) {
      this.oneSecondTimer = window.setInterval(() => {
        this.updateCopernicusMaps()
        this.setState({ currentTime: Date.now() })
      }, 2000)
    }
    this.map = this.refs.map as LeafletMap

    const pollutionServer = await this.pollutionService.fetchPollutionExternalServer()
    if (this.props.auth.authenticated && (isAdministrator(this.props.auth) || isScientist(this.props.auth))) {
      this.setState({ editPollutionConfig: pollutionServer })
    } else {
      this.setState({ editPollutionConfig: '' })
    }

    // organize layers
    await sleep(10)
    const x = document.getElementsByClassName('leaflet-control-layers-selector')
    for (const item of x) {
      const parentElem = item.parentElement
      if (parentElem && parentElem.lastChild) {
        if (
          parentElem.lastChild.textContent === ' Profiles Data' ||
          parentElem.lastChild.textContent === ' Annotations' ||
          parentElem.lastChild.textContent === ' Pollution Data'
        ) {
          parentElem.style.borderTop = '1px solid #ddd'
        }
        if (parentElem.lastChild.textContent === ' Measure track' || parentElem.lastChild.textContent === ' CCUS') {
          parentElem.style.borderBottom = '1px solid #ddd'
          parentElem.style.paddingBottom = '5px'
        }
      }
    }

    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }

  public updateCopernicusMaps() {
    if (this.props.hasSliderChanged) {
      this.lastWaveMapTime = MapUtils.buildRequestTime(this.props.sliderValue, 3)
      if (this.props.sliderValue < 0) {
        this.lastWindMapTime = MapUtils.buildRequestTime(this.props.sliderValue, 6)
      } else {
        this.lastWindMapTime = MapUtils.resetMapTime(6)
      }
      this.props.toggleSliderChange()
    }
  }

  public async componentDidUpdate() {
    if (this.props.vehicleSelectedLastState !== null) {
      const newSettings: IMapSettings = {
        lat: this.props.vehicleSelectedLastState.latitude,
        lng: this.props.vehicleSelectedLastState.longitude,
        zoom: 18,
      }
      this.map.leafletElement.setView([newSettings.lat, newSettings.lng], newSettings.zoom)
    }

    if (this.props.planSelectedPosition !== null) {
      const newSettings: IMapSettings = {
        lat: this.props.planSelectedPosition.latitude,
        lng: this.props.planSelectedPosition.longitude,
        zoom: 18,
      }
      this.map.leafletElement.setView([newSettings.lat, newSettings.lng], newSettings.zoom)
    }
  }

  public componentWillUnmount() {
    clearInterval(this.oneSecondTimer)
  }

  /**
   * Move waypoint if a plan and a waypoint are selected
   * @param e
   */
  public handleMapClick(e: any) {
    const clickLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng }
    switch (this.props.toolSelected) {
      case ToolSelected.MEASURE: {
        if (e.originalEvent.ctrlKey) {
          if (e.originalEvent.srcElement.getAttribute('alt') !== null) {
            const measureMarkerIndex = e.originalEvent.srcElement.getAttribute('alt').split('_').pop()
            this.onMapMeasureClickRemove(measureMarkerIndex)
          }
        } else {
          this.onMapMeasureClick(clickLocation)
        }
        break
      }
      case ToolSelected.ANNOTATION: {
        this.onMapAnnotationClick(clickLocation)
        break
      }
      case ToolSelected.TOOLPICK: {
        this.onMapToolpickClick(clickLocation)
        break
      }
      default:
        this.props.setSidePanelVisibility(false)
        break
    }

    if (e.originalEvent.srcElement.className && typeof e.originalEvent.srcElement.className.includes !== 'undefined') {
      // popup asset domain
      if (
        !e.originalEvent.srcElement.className.includes('assetOptDomain') &&
        !e.originalEvent.srcElement.className.includes('removeAsset')
      ) {
        this.setAssetSelected(undefined)
      }
    } else {
      // popup pollution data
      if (e.originalEvent.srcElement.nodeName !== 'BUTTON' && e.originalEvent.srcElement.nodeName !== 'INPUT') {
        if (this.state.pollutionEnable) {
          this.setState({ pollutionLocation: clickLocation })
        }
        if (this.state.obstacleEnable) {
          this.setState({ obstacleLocation: [...this.state.obstacleLocation, clickLocation] })
        }
        if (this.state.editObstacle) {
          this.setState({ editObstacle: undefined })
        }
      }
    }
  }

  public getGeoJSONSidePanelProperties(properties: any) {
    let obj = {}
    if (properties.lat) {
      obj = Object.assign({}, obj, { lat: properties.lat })
    }
    if (properties.lon) {
      obj = Object.assign({}, obj, { lng: properties.lon })
    }
    if (properties.CATEGORIA) {
      obj = Object.assign({}, obj, { category: properties.CATEGORIA })
    }
    return obj
  }

  public buildMyMaps() {
    return this.props.myMaps.map((map) => {
      return (
        <Overlay key={`Overlay_${map.name}`} checked={false} name={map.name}>
          <LayerGroup>
            <GeoJSON
              data={map.data}
              style={(feature: any) => {
                return {
                  color: feature.properties.stroke,
                  weight: feature.properties['stroke-width'],
                }
              }}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.on('click', (evt: any) => {
                    evt.originalEvent.view.L.DomEvent.stopPropagation(evt)
                    this.props.setSidePanelTitle(feature.properties.name)
                    this.props.setSidePanelContent(this.getGeoJSONSidePanelProperties(feature.properties))
                    this.props.setSidePanelVisibility(true)
                    this.props.setEditVehicle(undefined)
                  })
                }
              }}
              pointToLayer={(feature, latlng) => {
                return L.marker(latlng, { icon: new GeoJsonMarker() })
              }}
            />
          </LayerGroup>
        </Overlay>
      )
    })
  }

  public buildGeoLayers() {
    if (!this.props.auth.authenticated || !this.props.geoServerAddr || !this.props.geoLayers) {
      return <></>
    }
    return this.props.geoLayers.map((layer) => {
      const key = `GeoLayer_${layer.layerGroup}:${layer.layerName}`
      return (
        <Overlay key={key} checked={false} name={layer.layerName}>
          <WMSTileLayer
            url={`${this.props.geoServerAddr}/${layer.layerGroup}/wms`}
            service="WMS"
            version="1.1.0"
            request="GetMap"
            layers={key}
            format="image/png"
            transparent={true}
            tiled={true}
          />
        </Overlay>
      )
    })
  }

  public buildProfiles() {
    return this.props.profiles.map((profile, i) => {
      return <VerticalProfile key={'profile_' + i} data={profile} />
    })
  }

  public buildSpots() {
    return this.props.spots.map((spot) => {
      return (
        <SimpleAsset
          key={'spot_' + spot.imcid}
          data={spot}
          icon={new SpotIcon()}
          setAssetSelected={(v: IAsset | undefined) => this.setAssetSelected(v)}
        />
      )
    })
  }

  public buildCcus() {
    return this.props.ccus.map((ccu) => {
      return (
        <SimpleAsset
          key={'ccu_' + ccu.name}
          data={ccu}
          icon={new PCIcon()}
          setAssetSelected={(v: IAsset | undefined) => this.setAssetSelected(v)}
        />
      )
    })
  }

  public buildVehicles() {
    return this.props.vehicles.map((vehicle) => {
      return (
        <Vehicle
          key={'vehicle_' + vehicle.imcid}
          data={vehicle}
          currentTime={this.state.currentTime}
          isVehiclesLayerActive={this.state.isVehiclesLayerActive}
          setAssetSelected={(v: IAsset | undefined) => this.setAssetSelected(v)}
          currentZoom={this.state.currentZoom}
        />
      )
    })
  }

  public buildPollutionMarkers() {
    let pollution = this.props.pollution
    let obstacle = this.props.obstacle
    if (this.map) {
      const mapBounds = this.map.leafletElement.getBounds()
      pollution = pollution.filter((pollution) => mapBounds.contains([pollution.latitude, pollution.longitude]))
      obstacle = obstacle.filter((o) => mapBounds.contains([o.positions[0][0], o.positions[0][1]]))
    }

    if (this.state.isPollutionLayerActive) {
      return (
        <Pollution
          pollutionMarkers={pollution}
          locationSelected={this.state.pollutionLocation}
          pollutionOpen={this.state.pollutionOpen}
          addCircle={this.handleAddPollutionCircle}
          removeCircle={this.handleRemovePollutionCircle}
          obstacleLocationSelected={this.state.obstacleLocation}
          obstaclePolygons={obstacle}
          setObstacle={this.handleSelectedObstacle}
        />
      )
    } else {
      return <></>
    }
  }

  public buildPollutionDialog() {
    if (this.state.isPollutionLayerActive) {
      return (
        <div className="pollutionDialog">
          <form className="pollutionForm">
            {isAdministrator(this.props.auth) || isScientist(this.props.auth) ? (
              <div>
                {!this.state.pollutionEnable ? (
                  <Button className="m-1" color="info" size="sm" onClick={() => this.enablePollutionMarker()}>
                    New Pollution Marker
                  </Button>
                ) : (
                  <>
                    <span className="pollutionSpan">New Pollution Marker</span>
                    <input
                      type="text"
                      id="pollutionDescription"
                      value={this.state.pollutionDescription}
                      placeholder="Description"
                      onChange={this.handleChangePollutionDescription}
                    />

                    <label htmlFor="pollutionRadius">Radius (meters)</label>
                    <input
                      type="number"
                      id="pollutionRadius"
                      value={this.state.pollutionRadius}
                      placeholder="Radius (meters)"
                      onChange={this.handleChangePollutionRadius}
                    />

                    <div className="pollutionBtn">
                      <Button className="m-1" color="success" size="sm" onClick={() => this.addPollutionMarker()}>
                        Add
                      </Button>
                      <Button className="m-1" color="danger" size="sm" onClick={() => this.disablePollutionMarker()}>
                        Cancel
                      </Button>
                    </div>
                    <hr />
                  </>
                )}

                <Button className="m-1" color="warning" size="sm" onClick={() => this.syncAllPollutionMarkers()}>
                  Sync Pollution Markers
                </Button>

                <div className="obstacleForm">
                  <span className="pollutionSpan">Obstacles</span>
                  {!this.state.obstacleEnable ? (
                    <Button className="m-1" color="info" size="sm" onClick={() => this.drawObstacle()}>
                      New Obstacle
                    </Button>
                  ) : (
                    <div>
                      <input
                        type="text"
                        id="obstacleDescription"
                        value={this.state.obstacleDescription}
                        placeholder="Description"
                        onChange={this.handleChangeObstacleDescription}
                      />

                      <Button className="m-1" color="success" size="sm" onClick={() => this.addObstaclePolygon()}>
                        Add
                      </Button>
                      <Button
                        className="m-1"
                        color="danger"
                        size="sm"
                        onClick={() => this.setState({ obstacleEnable: false, obstacleLocation: [] })}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}

            {this.state.editPollutionMarker !== undefined ? (
              <div className="pollutionUpdateMarker">
                <hr />

                <label htmlFor="pollutionStatus">Status</label>
                <span id="pollutionStatus">{this.state.editPollutionMarker.status} </span>

                <label htmlFor="pollutionDateUpdate">Date</label>
                <span id="pollutionDateUpdate">
                  {DateService.timestampMsToReadableDate(this.state.editPollutionMarker.timestamp)}{' '}
                </span>

                <label htmlFor="pollutionDescriptionUpdate">Description</label>
                <input
                  type="text"
                  id="pollutionDescriptionUpdate"
                  value={this.state.pollutionDescriptionUpdate}
                  placeholder="Description"
                  onChange={this.handleChangePollutionDescriptionUpdate}
                  disabled={this.state.editPollutionMarker.status !== 'Created' ? true : false}
                />

                <label htmlFor="pollutionRadiusUpdate">Radius (meters)</label>
                <input
                  type="number"
                  id="pollutionRadiusUpdate"
                  value={this.state.pollutionRadiusUpdate}
                  placeholder="Radius (meters)"
                  onChange={this.handleChangePollutionRadiusUpdate}
                  disabled={this.state.editPollutionMarker.status !== 'Created' ? true : false}
                />

                <div>
                  <label htmlFor="pollutionLatitudeUpdate">Latitude</label>
                  <input
                    type="number"
                    id="pollutionLatitudeUpdate"
                    value={this.state.pollutionLatitudeUpdate}
                    placeholder="Latitude"
                    onChange={this.handleChangePollutionLatitudeUpdate}
                    disabled={this.state.editPollutionMarker.status !== 'Created' ? true : false}
                  />

                  <label htmlFor="pollutionLongitudeUpdate">Longitude</label>
                  <input
                    type="number"
                    id="pollutionLongitudeUpdate"
                    value={this.state.pollutionLongitudeUpdate}
                    placeholder="Longitude"
                    onChange={this.handleChangePollutionLongitudeUpdate}
                    disabled={this.state.editPollutionMarker.status !== 'Created' ? true : false}
                  />
                </div>

                {(isAdministrator(this.props.auth) || isScientist(this.props.auth)) &&
                this.state.editPollutionMarker.status === 'Created' ? (
                  <div className="pollutionBtn">
                    <Button
                      className="m-1"
                      color="success"
                      size="sm"
                      onClick={() => this.updatePollutionMarker(this.state.editPollutionMarker)}
                    >
                      Update Pollution Marker
                    </Button>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}

            {isAdministrator(this.props.auth) && !this.state.pollutionConfig ? (
              <div>
                <hr />
                <Button className="m-1" color="success" size="sm" onClick={() => this.handlePollutionConfig()}>
                  Config External Server
                </Button>
              </div>
            ) : isAdministrator(this.props.auth) && this.state.pollutionConfig ? (
              <div>
                <hr />
                <label htmlFor="pollutionConfigUpdate">External server</label>
                <input
                  type="text"
                  id="pollutionConfigUpdate"
                  value={this.state.editPollutionConfig}
                  placeholder="IP address"
                  onChange={this.handleChangePollutionConfig}
                />

                <Button className="m-1" color="success" size="sm" onClick={() => this.handleSavePollutionConfig()}>
                  Save
                </Button>

                <Button className="m-1" color="success" size="sm" onClick={() => this.handleClosePollutionConfig()}>
                  Cancel
                </Button>
              </div>
            ) : (
              <></>
            )}

            {(isAdministrator(this.props.auth) || isScientist(this.props.auth)) &&
            this.state.editPollutionMarker !== undefined &&
            (this.state.editPollutionMarker.status === 'Created' ||
              this.state.editPollutionMarker.status === 'Done') ? (
              <div>
                <Button className="m-1" color="danger" size="sm" onClick={() => this.togglePollutionModal()}>
                  Delete Pollution Marker
                </Button>
              </div>
            ) : (
              <></>
            )}

            {(isAdministrator(this.props.auth) || isScientist(this.props.auth)) &&
            this.state.editObstacle !== undefined ? (
              <div>
                <Button className="m-1" color="danger" size="sm" onClick={() => this.toggleObstacleModal()}>
                  Delete Obstacle
                </Button>
              </div>
            ) : (
              <></>
            )}
          </form>

          <Modal isOpen={this.state.isPollutionModalOpen} toggle={this.togglePollutionModal}>
            <ModalHeader toggle={this.togglePollutionModal}>Remove Focus of Pollution</ModalHeader>
            <ModalBody>The focus of pollution will be removed permanently. Do you want to continue?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => this.handleDeletePollution()}>
                Yes
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={this.state.isObstacleModalOpen} toggle={this.toggleObstacleModal}>
            <ModalHeader toggle={this.toggleObstacleModal}>Remove Obstacle</ModalHeader>
            <ModalBody>The obstacle will be removed permanently. Do you want to continue?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => this.handleDeleteObstacle()}>
                Yes
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      )
    }
  }

  public drawObstacle() {
    this.disablePollutionMarker()
    NotificationManager.info('Draw obstacle')
    this.setState({ obstacleEnable: true })
  }

  public async addObstaclePolygon() {
    if (this.state.obstacleLocation.length <= 2) {
      NotificationManager.warning('The obstacle polygon must have \nat least 3 points')
      return
    }

    const allPositions: number[][] = []
    this.state.obstacleLocation.forEach((o) => {
      const pos: number[] = []
      pos.push(o.latitude)
      pos.push(o.longitude)
      allPositions.push(pos)
    })

    try {
      const newObstaclePolygon = new IObstacle(
        this.state.obstacleDescription,
        allPositions,
        Date.now(),
        this.props.auth.currentUser.email
      )

      const response = await this.pollutionService.addObstacle(newObstaclePolygon)
      if (response.status === 'success') {
        NotificationManager.success(response.message)
        this.setState({ obstacleEnable: false, obstacleLocation: [] })
      } else {
        NotificationManager.warning('Obstacle polygon cannot be added')
      }
    } catch (error) {
      NotificationManager.warning('Obstacle polygon cannot be added')
    }
  }

  public togglePollutionModal() {
    this.setState((prevState) => ({
      isPollutionModalOpen: !prevState.isPollutionModalOpen,
    }))
  }

  public toggleObstacleModal() {
    this.setState((prevState) => ({
      isObstacleModalOpen: !prevState.isObstacleModalOpen,
    }))
  }

  public async handleDeletePollution() {
    if (this.state.editPollutionMarker) {
      this.togglePollutionModal()
      try {
        const response = await this.pollutionService.deletePollution(this.state.editPollutionMarker.id)
        if (response.status === 'Success') {
          NotificationManager.success(response.message)
          this.handleRemovePollutionCircle(this.state.editPollutionMarker)

          // update redux store
          this.props.setPollutionMarkers()
        } else {
          NotificationManager.warning(response.message)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  public async handleDeleteObstacle() {
    if (this.state.editObstacle) {
      this.toggleObstacleModal()

      try {
        const response = await this.pollutionService.deleteObstacle(this.state.editObstacle.id)
        if (response.status === 'Success') {
          NotificationManager.success(response.message)
          this.setState({ editObstacle: undefined })

          // update redux store
          this.props.setObstacles()
        } else {
          NotificationManager.warning(response.message)
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      NotificationManager.warning('Please select an obstacle')
    }
  }

  public handlePollutionConfig() {
    NotificationManager.info('Please specify the server for where\n the pollution markers should be send')
    this.setState({ pollutionConfig: true })
  }

  public handleChangePollutionConfig(event: any) {
    this.setState({ editPollutionConfig: event.target.value })
  }

  public async handleSavePollutionConfig() {
    try {
      const response = await this.pollutionService.updatePollutionExternalServer(this.state.editPollutionConfig)
      if (response.status === 'success') {
        NotificationManager.success('Pollution server updated')
        this.setState({ pollutionConfig: false })
      } else {
        NotificationManager.warning('Pollution server cannot be updated')
      }
    } catch (error) {
      NotificationManager.warning('Pollution server cannot be updated')
    }
  }

  public handleClosePollutionConfig() {
    this.setState({ pollutionConfig: false })
  }

  public handleAddPollutionCircle(marker: IPollution) {
    this.setState({
      pollutionOpen: [...this.state.pollutionOpen, marker],
      editPollutionMarker: marker,
    })
    this.handlePollutionEdit(this.state.editPollutionMarker)
  }

  public handleRemovePollutionCircle(marker: IPollution) {
    const pollutionArray = [...this.state.pollutionOpen]
    const index = pollutionArray.indexOf(marker)
    if (index !== -1) {
      pollutionArray.splice(index, 1)
      this.setState({ pollutionOpen: pollutionArray })
    }
    if (this.state.editPollutionMarker !== undefined) {
      if (this.state.pollutionOpen.length > 0) {
        this.setState({
          editPollutionMarker: this.state.pollutionOpen[this.state.pollutionOpen.length - 1],
        })
        this.handlePollutionEdit(this.state.editPollutionMarker)
      } else {
        this.setState({
          editPollutionMarker: undefined,
          pollutionDescriptionUpdate: '',
          pollutionRadiusUpdate: 20,
        })
      }
    }
  }

  public handleSelectedObstacle(obstacle: IObstacle) {
    this.setState({ editObstacle: obstacle })
  }

  public handleChangePollutionDescription(event: any) {
    this.setState({ pollutionDescription: event.target.value })
  }
  public handleChangePollutionRadius(event: any) {
    this.setState({ pollutionRadius: event.target.value })
  }
  public handleChangePollutionDescriptionUpdate(event: any) {
    this.setState({ pollutionDescriptionUpdate: event.target.value })
  }
  public handleChangePollutionRadiusUpdate(event: any) {
    this.setState({ pollutionRadiusUpdate: event.target.value })
  }
  public handleChangePollutionLatitudeUpdate(event: any) {
    this.setState({ pollutionLatitudeUpdate: event.target.value })
  }
  public handleChangePollutionLongitudeUpdate(event: any) {
    this.setState({ pollutionLongitudeUpdate: event.target.value })
  }
  public handleChangeObstacleDescription(event: any) {
    this.setState({ obstacleDescription: event.target.value })
  }

  public handlePollutionEdit(pollutionMarker: IPollution | undefined) {
    this.setState({ editPollutionMarker: pollutionMarker })
    if (pollutionMarker !== undefined) {
      this.setState({
        pollutionDescriptionUpdate: pollutionMarker.description,
        pollutionRadiusUpdate: pollutionMarker.radius,
        pollutionLatitudeUpdate: pollutionMarker.latitude,
        pollutionLongitudeUpdate: pollutionMarker.longitude,
      })
    }
  }

  public async addPollutionMarker() {
    if (this.state.pollutionRadius < 20) {
      NotificationManager.warning('The radius must be greater than 20')
    } else {
      if (this.state.pollutionLocation) {
        try {
          const newPollutionMarker = new IPollution(
            this.state.pollutionDescription,
            this.state.pollutionRadius,
            this.state.pollutionLocation.latitude,
            this.state.pollutionLocation.longitude,
            Date.now(),
            'Created',
            this.props.auth.currentUser.email
          )
          const response = await this.pollutionService.updatePollution(newPollutionMarker, -1)
          if (response.status === 'success') {
            NotificationManager.success('Pollution marker added')
            this.setState({
              pollutionEnable: false,
              pollutionLocation: undefined,
              pollutionDescription: '',
              pollutionRadius: 20,
            })
          } else {
            NotificationManager.warning('Pollution marker cannot be added')
          }
        } catch (error) {
          NotificationManager.warning('Pollution marker cannot be added')
        }
      } else {
        NotificationManager.warning('No selected location')
      }
    }
  }

  public async updatePollutionMarker(marker: IPollution | undefined) {
    if (this.state.pollutionRadiusUpdate < 20) {
      NotificationManager.warning('The radius must be greater than 20')
    } else {
      if (marker !== undefined) {
        try {
          const newPollutionMarker = new IPollution(
            this.state.pollutionDescriptionUpdate,
            this.state.pollutionRadiusUpdate,
            this.state.pollutionLatitudeUpdate,
            this.state.pollutionLongitudeUpdate,
            marker.timestamp,
            marker.status,
            marker.user
          )
          const response = await this.pollutionService.updatePollution(newPollutionMarker, marker.id)
          if (response.status === 'success') {
            NotificationManager.success('Pollution marker updated')
            this.setState({
              pollutionEnable: false,
              pollutionLocation: undefined,
              pollutionDescriptionUpdate: '',
              pollutionRadiusUpdate: 20,
              editPollutionMarker: undefined,
            })
            this.handleRemovePollutionCircle(marker)
          } else {
            NotificationManager.warning('Pollution marker cannot be updated')
          }
        } catch (error) {
          NotificationManager.warning('Pollution marker cannot be updated')
        }
      } else {
        NotificationManager.error('Please select pollution marker')
      }
    }
  }

  public async syncAllPollutionMarkers() {
    if (this.state.editPollutionConfig.length === 0) {
      NotificationManager.warning('The server is not defined. \nPlease contact an administrator')
    } else {
      try {
        const response = await this.pollutionService.syncPollutionMarkers(this.state.editPollutionConfig)
        if (response.status === 'success') {
          NotificationManager.success(response.message)
        } else {
          NotificationManager.error(response.message)
        }
      } catch (error) {
        NotificationManager.warning('Pollution markers cannot be synched')
      }
    }
  }

  public enablePollutionMarker() {
    NotificationManager.info('Please select a location \non the map')
    this.setState({ pollutionEnable: true, obstacleEnable: false, obstacleLocation: [] })
  }

  public disablePollutionMarker() {
    this.setState({ pollutionEnable: false, pollutionLocation: undefined })
  }

  public buildAisShips() {
    let ships = this.props.aisShips
    if (this.map) {
      const mapBounds = this.map.leafletElement.getBounds()
      ships = ships.filter((ship) => mapBounds.contains([ship.latitude, ship.longitude]))
    }
    return ships.map((ship) => {
      return (
        <AISShip
          key={'ship_' + ship.mmsi}
          currentTime={this.state.currentTime}
          ship={ship}
          isToDrawAISPolygons={this.state.isToDrawAISPolygons}
          isAISLayerActive={this.state.isAISLayerActive}
          currentZoom={this.state.currentZoom}
        />
      )
    })
  }

  public drawCanvas(info: any) {
    if (this.state.currentZoom > 10 || this.state.currentZoom === undefined) {
      const ctx = info.canvas.getContext('2d')
      ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)
      ctx.fillStyle = 'rgba(255,116,0, 0.2)'
      this.props.aisShips.forEach((ship) => {
        const aisCanvas = new AISCanvas({
          perpLinesSize: this.state.perpLinesSize,
          ship,
        })
        let drawMeasure = false
        if (this.state.currentZoom > 15) {
          drawMeasure = true
        }
        aisCanvas.drawInCanvas(info, drawMeasure)
      })
    } else {
      // clear canvas
      const ctx = info.canvas.getContext('2d')
      ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)
    }
  }

  public async handleMove(e: any) {
    if (!this.props.auth.authenticated || !this.map) {
      return
    }
    const center = this.map.leafletElement.getBounds().getCenter()
    const zoom = this.map.leafletElement.getZoom()
    const newSettings: IMapSettings = {
      lat: center.lat,
      lng: center.lng,
      zoom,
    }
    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      await MapUtils.updateMapSettings(newSettings)
    }
    this.props.selectVehicleLastState(null)
    this.props.selectPlanPosition(null)
  }

  public handleZoom(e: any) {
    const newZoom = e.target._animateToZoom
    let newLineLength = 0
    if (newZoom > 7) {
      newLineLength = 138598 * Math.pow(newZoom, -2.9)
      this.setState({
        perpLinesSize: Math.round(newLineLength),
      })
      if (newZoom > 12) {
        if (!this.state.isToDrawAISPolygons) {
          this.toggleDrawAisLocations()
        }
      } else {
        if (this.state.isToDrawAISPolygons) {
          this.toggleDrawAisLocations()
        }
      }
    }
    this.handleMove(e)
    this.setState({ currentZoom: newZoom })
  }

  public toggleDrawAisLocations() {
    this.setState({
      isToDrawAISPolygons: !this.state.isToDrawAISPolygons,
    })
  }

  private setLeafletMapRef(map: any) {
    this.map = map
  }

  private onMeasureToggle() {
    if (this.props.toolSelected === ToolSelected.MEASURE) {
      this.props.setToolSelected(ToolSelected.NONE)
      this.props.setSidePanelVisibility(false)
      this.props.clearMeasure()
    } else {
      this.props.setToolSelected(ToolSelected.MEASURE)
      this.props.setSidePanelVisibility(true)
      this.props.setSidePanelTitle('Measure distance')
      this.props.setSidePanelContent({})
      this.props.setEditVehicle(undefined)
    }
  }

  private onToolpickToogle(weatherParam: WeatherParam | null) {
    if (weatherParam !== null) {
      this.props.setToolSelected(ToolSelected.TOOLPICK)
    } else if (this.props.toolSelected === ToolSelected.TOOLPICK) {
      this.props.setToolSelected(ToolSelected.NONE)
    }
    this.props.setWeatherParam(weatherParam)
    this.props.setToolClickLocation(null)
  }

  private onGpsClick() {
    this.props.toggleGps()
  }

  private onAnnotationToggle() {
    if (this.props.toolSelected === ToolSelected.ANNOTATION) {
      this.props.setToolSelected(ToolSelected.NONE)
    } else {
      this.props.setToolSelected(ToolSelected.ANNOTATION)
    }
    this.props.setSidePanelVisibility(false)
  }

  public buildWeatherSelector() {
    return (
      <UncontrolledDropdown nav={true}>
        <DropdownToggle nav={true} caret={false}>
          <i
            className={'fas fa-map-pin fa-lg ' + (this.props.toolSelected === ToolSelected.TOOLPICK ? 'selected' : '')}
            title="Enable Weather Toolpick"
          />
        </DropdownToggle>
        <DropdownMenu right={false} className="weather-menu">
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.AIR_TEMPERATURE)}>
            Air Temperature
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.CURRENT_DIRECTION)}>
            Current Direction
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.CURRENT_SPEED)}>Current Speed</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.GUST)}>Wind gust</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WATER_TEMPERATURE)}>
            Water Temperature
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WAVE_DIRECTION)}>Wave Direction</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WAVE_HEIGHT)}>Wave Height</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WIND_DIRECTION)}>Wind Direction</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WIND_SPEED)}>Wind Speed</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(null)}>None</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  public render() {
    return (
      <>
        <LeafletMap
          ref={(m) => this.setLeafletMapRef(m)}
          fullscreenControl={true}
          center={{ lat: this.state.settings.lat, lng: this.state.settings.lng }}
          zoom={this.state.settings.zoom}
          maxZoom={19}
          onClick={this.handleMapClick}
          onMoveend={this.handleMove}
          onZoomend={this.handleZoom}
          onOverlayAdd={(evt: any) => {
            // this is done for perfomance reasons
            if (evt.name === 'AIS Data') {
              this.setState({ isAISLayerActive: true })
            } else if (evt.name === 'Vehicles') {
              this.setState({ isVehiclesLayerActive: true })
            } else if (
              evt.name.startsWith('Copernicus') ||
              evt.name === 'Sea Surface Temperature' ||
              evt.name === 'Sea Surface Salinity' ||
              evt.name === 'Sea Surface Velocity' ||
              evt.name === 'Chl Concentration' ||
              evt.name === 'Waves' ||
              evt.name === 'Wind' ||
              evt.name === 'Sea Level Anomaly'
            ) {
              this.props.setMapOverlayInfo(evt.name)
              const url = MapUtils.buildLegendURL(evt.layer)
              this.setState({
                activeLegend: <img className="mapLegend" src={url} alt="Map legend" />,
              })
              return
            } else if (evt.name === 'Pollution Data') {
              this.setState({ isPollutionLayerActive: true })
            }
          }}
          onOverlayRemove={(evt: any) => {
            if (evt.name === 'AIS Data') {
              this.setState({ isAISLayerActive: false })
            } else if (evt.name === 'Vehicles') {
              this.setState({ isVehiclesLayerActive: false })
            } else if (
              evt.name.startsWith('Copernicus') ||
              evt.name === 'Sea Surface Temperature' ||
              evt.name === 'Sea Surface Salinity' ||
              evt.name === 'Sea Surface Velocity' ||
              evt.name === 'Chl Concentration' ||
              evt.name === 'Waves' ||
              evt.name === 'Wind' ||
              evt.name === 'Sea Level Anomaly'
            ) {
              this.setState({
                activeLegend: <></>,
              })
              this.props.setMapOverlayInfo('')
            } else if (evt.name === 'Pollution Data') {
              this.setState({ isPollutionLayerActive: false })
            }
          }}
        >
          <LayersControl position="topright">
            <BaseLayer checked={true} name="OpenStreetMap">
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="ArcGIS NatGeo">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
                attribution="Map data &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC"
                id="examples.map-i875mjb7"
              />
            </BaseLayer>
            <BaseLayer name="ArcGIS Ocean">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; ESRI"
                maxZoom={13}
              />
            </BaseLayer>
            <BaseLayer name="ArcGis World Imagery">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; ESRI"
              />
            </BaseLayer>
            <BaseLayer name="Thunder Forest">
              <TileLayer
                url="https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=c4d207cad22c4f65b9adb1adbbaef141"
                attribution="Tiles &copy; ThunderForest"
              />
            </BaseLayer>
            <BaseLayer name="GMRT">
              <WMSTileLayer
                layers="gmrt"
                url="https://www.gmrt.org/services/mapserver/wms_merc?service=WMS&version=1.0.0&request=GetMap"
                attribution="GEBCO (multiple sources)"
              />
            </BaseLayer>
            <Overlay checked={true} name="Vehicles">
              <LayerGroup>{this.buildVehicles()}</LayerGroup>
              {this.buildEditVehicleModal()}
            </Overlay>
            <Overlay checked={true} name="Spots">
              <LayerGroup>{this.buildSpots()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="CCUS">
              <LayerGroup>{this.buildCcus()}</LayerGroup>
            </Overlay>
            {this.props.auth.authenticated && (
              <Overlay checked={true} name="Plans">
                <LayerGroup>
                  <PlanManager mapRef={this.map} />
                </LayerGroup>
              </Overlay>
            )}
            <Overlay checked={this.state.isAISLayerActive} name="AIS Data">
              <LayerGroup>
                {this.buildAisShips()}
                <CanvasLayer drawMethod={this.drawCanvas} />
              </LayerGroup>
            </Overlay>
            <Overlay name="AIS density">
              <TileLayer
                url="https://tiles2.marinetraffic.com/ais/density_tiles2015/{z}/{x}/tile_{z}_{x}_{y}.png"
                attribution="Map data &copy; MarineTraffic"
                maxZoom={21}
                opacity={0.5}
                maxNativeZoom={10}
              />
            </Overlay>
            <Overlay name="Bathymetry">
              <WMSTileLayer
                url="https://ows.emodnet-bathymetry.eu/wms"
                layers="mean_multicolour"
                format="image/png"
                // styles="boxfill/sst_36"
                transparent={true}
                // colorscalerange="0,36"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.5}
                attribution="EMODNET"
              />
            </Overlay>
            <Overlay checked={false} name="Profiles Data">
              <LayerGroup>{this.buildProfiles()}</LayerGroup>
            </Overlay>
            <Overlay name="Sea Surface Temperature">
              <WMSTileLayer
                url="https://nrt.cmems-du.eu/thredds/wms/cmems_mod_ibi_phy_anfc_0.027deg-3D_P1D-m"
                layers="thetao"
                format="image/png"
                styles="boxfill/sst_36"
                transparent={true}
                colorscalerange="12,28"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Sea Surface Salinity">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024"
                layers="so"
                format="image/png"
                styles="boxfill/rainbow"
                transparent={true}
                colorscalerange="33,36"
                belowmincolor="extend"
                belowmaxcolor="extend"
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Sea Surface Velocity">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024"
                layers="sea_water_velocity"
                format="image/png"
                styles="vector/rainbow"
                transparent={true}
                colorscalerange="0,2"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Chl Concentration">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/dataset-oc-glo-chl-multi-l4-oi_4km_daily-rt-v02"
                layers="CHL"
                format="image/png"
                styles="boxfill/alg2"
                transparent={true}
                logscale="true"
                colorscalerange="0.01,10.0"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Waves">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-wav-001-027"
                time={this.lastWaveMapTime}
                styles="boxfill/rainbow"
                layers="VHM0"
                colorscalerange="0.01,10.0"
                belowmincolor="extend"
                belowmaxcolor="extend"
                transparent={true}
                format="image/png"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Wind">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/CERSAT-GLO-BLENDED_WIND_L4-V6-OBS_FULL_TIME_SERIE"
                time={this.lastWindMapTime}
                styles="vector/rainbow"
                layers="wind"
                elevation={10}
                colorscalerange="0.0,23.0"
                belowmincolor="extend"
                belowmaxcolor="extend"
                transparent={true}
                format="image/png"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Sea Level Anomaly">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/dataset-duacs-nrt-global-merged-allsat-phy-l4"
                layers="ugosa"
                format="image/png"
                transparent={true}
                styles="boxfill/redblue"
                colorscalerange="-0.8,0.8"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay checked={true} name="Annotations">
              <LayerGroup>{this.buildAnnotations()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Current Location">
              <LayerGroup>{this.buildUsersLocations()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Measure track">
              <LayerGroup>{this.buildMeasureTrack()}</LayerGroup>
            </Overlay>
            {this.buildMyMaps()}
            {this.buildGeoLayers()}
            {this.props.auth.authenticated && this.props.auth.currentUser.domain.includes('Ramp') && this.map && (
              <Overlay checked={this.state.isPollutionLayerActive} name="Pollution Data">
                <LayerGroup>{this.buildPollutionMarkers()}</LayerGroup>
                {this.buildPollutionDialog()}
              </Overlay>
            )}
          </LayersControl>
          {this.buildNewAnnotationMarker()}
          {this.buildToolpickMarker()}
          {this.buildDomainDialog()}
          {this.buildRipplesTools()}
        </LeafletMap>
        {this.state.activeLegend}
      </>
    )
  }

  private async fetchMapSettings() {
    const userMapSettings: IMapSettings = await MapUtils.fetchUserMapSettings()
    this.setState({
      settings: {
        lat: userMapSettings.lat,
        lng: userMapSettings.lng,
        zoom: userMapSettings.zoom,
      },
    })
  }

  private buildUsersLocations() {
    return (
      <>
        {this.props.isGpsActive && <ClientLocation onLocationClick={this.onLocationClick} />}
        {this.props.auth.authenticated &&
          this.props.usersLocations.map((u: IUserLocation) => {
            const center = {
              lat: u.latitude,
              lng: u.longitude,
            }
            return (
              <>
                <Marker position={center} onClick={() => this.onLocationClick(u)} icon={new PCIcon()} />
                <Circle center={center} radius={u.accuracy} />
              </>
            )
          })}
      </>
    )
  }

  private onLocationClick(u: IUserLocation) {
    if (this.props.auth.currentUser.email === u.email) {
      this.props.setSidePanelTitle('Your Current Location')
    } else {
      this.props.setSidePanelTitle(`User's ${u.name} Current Location`)
    }
    this.props.setSidePanelContent({
      Latitude: u.latitude.toFixed(5),
      Longitude: u.longitude.toFixed(5),
      Accuracy: u.accuracy + 'm',
      Timestamp: DateService.timestampMsToReadableDate(u.timestamp),
    })
    this.props.setSidePanelVisibility(true)
    this.props.setEditVehicle(undefined)
  }

  private buildAnnotations() {
    return this.props.annotations.map((a: IAnnotation) => {
      return (
        <Marker
          key={'annotation_' + a.id}
          position={{ lat: a.latitude, lng: a.longitude }}
          onClick={() => {
            this.props.setSidePanelTitle(`Annotation ${a.id}`)
            this.props.setSidePanelContent({
              user: a.username,
              date: DateService.timestampMsToReadableDate(a.date),
              content: a.content,
            })
            this.props.setSidePanelVisibility(true)
            this.props.setEditVehicle(undefined)
          }}
        />
      )
    })
  }

  private buildMeasureTrack() {
    const positions = this.props.measurePath.map((p) => {
      return { lat: p.latitude, lng: p.longitude }
    })
    const markers = positions.map((location, i) => (
      <Marker
        key={'marker_' + i}
        alt={'measure_' + i}
        title={'Press CTRL and click to delete point'}
        icon={this.blueCircleIcon}
        position={location}
      />
    ))
    return (
      <>
        <Polyline positions={positions} />
        {markers}
      </>
    )
  }

  private onMapMeasureClick(clickLocation: ILatLng) {
    this.props.addMeasurePoint(clickLocation)
    const distance = this.positionService.measureTotalDistance(this.props.measurePath)
    if (this.props.measurePath.length > 1) {
      const angle = this.positionService.getHeadingFromTwoPoints(
        this.props.measurePath[this.props.measurePath.length - 2],
        this.props.measurePath[this.props.measurePath.length - 1]
      )
      this.props.setSidePanelContent({
        length: `${distance} m`,
        angle: `${angle.toFixed(2)} º`,
      })
    } else {
      this.props.setSidePanelContent({
        length: `${distance} m`,
      })
    }
    this.props.setEditVehicle(undefined)
  }

  private onMapMeasureClickRemove(index: number) {
    this.props.removeMeasurePoint(index)
    const distance = this.positionService.measureTotalDistance(this.props.measurePath)
    if (this.props.measurePath.length > 1) {
      const angle = this.positionService.getHeadingFromTwoPoints(
        this.props.measurePath[this.props.measurePath.length - 2],
        this.props.measurePath[this.props.measurePath.length - 1]
      )
      this.props.setSidePanelContent({
        length: `${distance} m`,
        angle: `${angle.toFixed(2)} º`,
      })
    } else {
      this.props.setSidePanelContent({
        length: `${distance} m`,
      })
    }
    this.props.setEditVehicle(undefined)
  }

  private async getDomains() {
    const domains: string[] = await fetchDomainNames()
    this.setState({ domains })
  }

  private onMapAddClick(clickLocation: ILatLng) {
    this.props.setSidePanelVisibility(false)
    this.setAssetSelected(undefined)
    if (this.props.selectedPlan.id.length === 0) {
      return
    }
    this.props.addWpToPlan(Object.assign({}, clickLocation, { timestamp: 0 }))
  }

  private onMapMoveClick(clickLocation: ILatLng) {
    this.props.setSidePanelVisibility(false)
    this.setAssetSelected(undefined)
    if (this.props.selectedPlan.id.length === 0) {
      return
    }
    if (this.props.selectedWaypointIdx !== -1) {
      this.props.updateWpLocation(clickLocation)
      this.props.setSelectedWaypointIdx(-1)
    }
  }

  private buildNewAnnotationMarker() {
    if (this.props.toolSelected === ToolSelected.ANNOTATION) {
      const location = this.props.toolClickLocation
      if (location == null) {
        return <></>
      }
      return (
        <Marker position={{ lat: location.latitude, lng: location.longitude }}>
          <Popup
            ref={this.newAnnotationPopupRef}
            onClose={() => {
              this.props.setToolClickLocation(null)
            }}
          >
            <textarea
              name="content"
              placeholder="Add your note"
              onChange={(evt) => {
                this.setState({ newAnnotationContent: evt.target.value })
              }}
              value={this.state.newAnnotationContent}
            />
            <Button
              onClick={async () => {
                if (this.newAnnotationPopupRef.current != null) {
                  this.newAnnotationPopupRef.current.onClose()
                }
                try {
                  await this.logBookService.addAnnotation(new NewAnnotation(this.state.newAnnotationContent, location))
                } catch (e) {
                  NotificationManager.error('Please create a logbook first')
                }

                this.setState({ newAnnotationContent: '' })
              }}
            >
              Submit
            </Button>
          </Popup>
        </Marker>
      )
    }
  }

  /**
   * When a click is detected on the map and the Annotation tool is selected
   * @param location The click location
   */
  private onMapAnnotationClick(location: ILatLng) {
    this.props.setToolClickLocation(location)
  }

  private buildEditVehicleModal() {
    if (!this.props.editVehicle) {
      return
    }
    return (
      <Modal className="vehicle-modal" isOpen={this.props.isVehicleModalOpen} toggle={this.props.onSettingsClick}>
        <ModalHeader toggle={this.props.onSettingsClick}>Edit vehicle settings</ModalHeader>
        <ModalBody>
          <ul>
            {this.props.editVehicle.settings.map((param: string[]) => {
              const key: string = param[0]
              const value: string = param[1]
              return (
                <li key={key}>
                  <Label for={key}>{key}</Label>
                  <Input type="text" value={value} onChange={(evt: any) => this.updateVehicleParam(evt, key)} />
                </li>
              )
            })}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onEditVehicle}>
            Save changes
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  private updateVehicleParam(evt: any, key: string) {
    if (!this.props.editVehicle) {
      return
    }
    const newValue = evt.target.value
    const editVehicle = JSON.parse(JSON.stringify(this.props.editVehicle))
    const index = editVehicle.settings.findIndex((param: string[]) => param[0] === key)
    editVehicle.settings[index][1] = newValue
    this.props.setEditVehicle(editVehicle)
    this.vehicleChangedSettings.set(key, newValue)
  }

  private async onEditVehicle() {
    const index = this.props.vehicles.findIndex(
      (v: IAsset) => this.props.editVehicle && isSameAsset(v, this.props.editVehicle)
    )
    if (index === -1 || !this.props.editVehicle) {
      return
    }
    try {
      const response = await this.soiService.updateSoiSettings(
        this.props.editVehicle.imcid,
        this.vehicleChangedSettings
      )
      const vehicleCopy = JSON.parse(JSON.stringify(this.props.vehicles[index]))
      vehicleCopy.settings = [...this.props.editVehicle.settings]
      this.props.updateVehicle(vehicleCopy)
      NotificationManager.success(response.message)
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private setAssetSelected(system: IAsset | undefined) {
    this.setState({ assetSelected: system })
  }

  private buildDomainDialog() {
    if (this.props.auth.authenticated && isAdministrator(this.props.auth) && this.state.assetSelected !== undefined) {
      const assetId = this.state.assetSelected.name

      const domain: string[] = []
      this.state.assetSelected.domain.forEach((d) => {
        domain.push(d)
      })

      return (
        <div className="domainDialog">
          <div className="input-domain-asset">
            <label className="domain-label">Domain</label>
            {this.state.domains.map((d, index) => {
              return (
                <label className={'assetOptDomainLabel'} key={index}>
                  <input
                    type="checkbox"
                    className={'assetOptDomain'}
                    value={d}
                    checked={domain.includes(d) ? true : false}
                    onChange={this.handleAssetChangeDomain}
                    asset-id={assetId}
                  />
                  {d}
                </label>
              )
            })}
          </div>
          <div className="input-remove-asset">
            <hr className="domainDialog-separator" />
            <Button className="removeAsset" color="danger" size="sm" onClick={() => this.toggleRemoveAssetModal()}>
              Remove
            </Button>
          </div>

          <Modal isOpen={this.state.isRemoveAssetModalOpen} toggle={this.toggleRemoveAssetModal}>
            <ModalHeader toggle={this.toggleRemoveAssetModal}>Remove asset</ModalHeader>
            <ModalBody>The asset will be removed permanently. Do you want to continue?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => this.handleDeleteAsset()}>
                Yes
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      )
    }
  }

  public async handleAssetChangeDomain(event: any) {
    const assetID = event.target.getAttribute('asset-id')
    let system: IAsset
    if (assetID.startsWith('spot')) {
      system = this.props.spots.filter((item) => item.name === assetID)[0]
    } else if (assetID.startsWith('ccu')) {
      system = this.props.ccus.filter((item) => item.name === assetID)[0]
    } else {
      system = this.props.vehicles.filter((item) => item.name === assetID)[0]
    }

    const domains: any = document.getElementsByClassName('assetOptDomain')
    const domainSelected: string[] = []
    for (const domain of domains) {
      if (domain.checked) domainSelected.push(domain.value)
    }

    this.props.updateAssets(system, domainSelected)

    this.setState({ assetSelected: undefined })
  }

  private buildRipplesTools() {
    return (
      <div className={this.props.auth.authenticated ? 'ripples-tools' : 'ripples-tools-nologin'}>
        <div className="tool-ruler">
          <i
            onClick={this.onMeasureToggle}
            className={
              'fas fa-ruler-horizontal fa-lg ' + (this.props.toolSelected === ToolSelected.MEASURE ? 'selected' : '')
            }
            title="Measure Tool"
          />
        </div>

        {this.props.auth.authenticated && !isCasual(this.props.auth) && (
          <div className="tool-annotation">
            <i
              onClick={this.onAnnotationToggle}
              className={
                'far fa-sticky-note fa-lg ' + (this.props.toolSelected === ToolSelected.ANNOTATION ? 'selected' : '')
              }
              title="Annotation Tool"
            />
          </div>
        )}

        {this.props.auth.authenticated && !isCasual(this.props.auth) && (
          <div className="tool-weather">{this.buildWeatherSelector()}</div>
        )}

        <div className="tool-gps">
          <i
            onClick={this.onGpsClick}
            className={'fas fa-map-marker-alt fa-lg ' + (this.props.isGpsActive ? 'selected' : '')}
            title="Enable Gps Tracking"
          />
        </div>
      </div>
    )
  }

  public async handleDeleteAsset() {
    if (this.state.assetSelected !== undefined) {
      try {
        const response = await this.soiService.deleteAsset(this.state.assetSelected.name)
        if (response.status === 'Success') {
          const assetsUpdated: IAsset[] = []
          if (this.state.assetSelected.name.startsWith('spot')) {
            this.props.spots.forEach((spot) => {
              if (this.state.assetSelected !== undefined && spot.name !== this.state.assetSelected.name) {
                assetsUpdated.push(spot)
              }
            })
            this.props.setSpots(assetsUpdated)
          } else if (this.state.assetSelected.name.startsWith('ccu')) {
            this.props.ccus.forEach((ccu) => {
              if (this.state.assetSelected !== undefined && ccu.name !== this.state.assetSelected.name) {
                assetsUpdated.push(ccu)
              }
            })
            this.props.setCcus(assetsUpdated)
          } else {
            this.props.vehicles.forEach((vehicle) => {
              if (this.state.assetSelected !== undefined && vehicle.name !== this.state.assetSelected.name) {
                assetsUpdated.push(vehicle)
              }
            })
            this.props.setVehicles(assetsUpdated)
          }

          NotificationManager.success(response.message)
        } else {
          NotificationManager.error(response.message)
        }
      } catch (error) {
        NotificationManager.error('Cannot delete asset')
      }
    }
    this.setAssetSelected(undefined)
    this.toggleRemoveAssetModal()
  }

  public toggleRemoveAssetModal() {
    this.setState((prevState) => ({
      isRemoveAssetModalOpen: !prevState.isRemoveAssetModalOpen,
    }))
  }

  private async onMapToolpickClick(clickLocation: ILatLng) {
    this.props.setToolClickLocation(clickLocation)
    try {
      if (!this.props.weatherParam) {
        return
      }
      const response = await MapUtils.fetchWeatherData(clickLocation, this.props.weatherParam)
      this.setState({ clickLocationWeather: response })
    } catch (error) {
      NotificationManager.error(error.message)
    }
  }

  private buildToolpickMarker() {
    if (this.props.toolSelected === ToolSelected.TOOLPICK) {
      const location = this.props.toolClickLocation
      const weather: IWeather[] = this.state.clickLocationWeather
      if (!(location && weather.length > 0 && this.props.weatherParam)) {
        return
      }
      const sourcesData: WeatherSource = this.weatherService.joinSourceValues(weather, this.props.weatherParam)
      const graphData: WeatherData[] = this.weatherService.preparePlotData(sourcesData)
      return (
        <Marker position={this.positionService.getLatLng(location)}>
          <Popup minWidth={300} maxWidth={600}>
            <WeatherLinePlot param={this.props.weatherParam} data={graphData} />
          </Popup>
        </Marker>
      )
    }
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
    aisLocations: state.assets.aisDrawableLocations,
    aisShips: state.assets.aisShips,
    plans: state.planSet,
    profiles: state.profiles,
    selectedPlan: state.selectedPlan,
    selectedWaypointIdx: state.selectedWaypointIdx,
    spots: state.assets.spots,
    ccus: state.assets.ccus,
    toolSelected: state.toolSelected,
    isGpsActive: state.isGpsActive,
    vehicles: state.assets.vehicles,
    measurePath: state.measurePath,
    annotations: state.annotations,
    usersLocations: state.usersLocations,
    isVehicleModalOpen: state.isVehicleModalOpen,
    editVehicle: state.editVehicle,
    sliderValue: state.sliderValue,
    hasSliderChanged: state.hasSliderChanged,
    weatherParam: state.weatherParam,
    toolClickLocation: state.toolClickLocation,
    geoLayers: state.geoLayers,
    pollution: state.pollution,
    obstacle: state.obstacle,
    vehicleSelectedLastState: state.vehicleSelectedLastState,
    planSelectedPosition: state.planSelectedPosition,
  }
}

const actionCreators = {
  addWpToPlan,
  selectVehicleLastState,
  selectPlanPosition,
  setSelectedWaypointIdx,
  setCcus,
  setVehicles,
  setSpots,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setToolSelected,
  updateWpLocation,
  addMeasurePoint,
  removeMeasurePoint,
  clearMeasure,
  toggleVehicleModal,
  setEditVehicle,
  setMapOverlayInfo,
  setToolClickLocation,
  updateVehicle,
  toggleSliderChange,
  toggleGps,
  setWeatherParam,
}

export default connect(mapStateToProps, actionCreators)(RipplesMap)
