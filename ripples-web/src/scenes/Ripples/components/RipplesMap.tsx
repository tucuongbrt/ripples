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
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import IAisShip, { IShipLocation } from '../../../model/IAisShip'
import IAnnotation, { NewAnnotation } from '../../../model/IAnnotations'
import IAsset, { isSameAsset } from '../../../model/IAsset'
import IAuthState, { isAdministrator, isCasual, IUserLocation } from '../../../model/IAuthState'
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
  addWpToPlan,
  clearMeasure,
  setEditVehicle,
  setMapOverlayInfo,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setToolClickLocation,
  toggleSliderChange,
  toggleVehicleModal,
  updateVehicle,
  updateWpLocation,
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
import { BlueCircleIcon, PCIcon, SpotIcon } from './Icons'
import SimpleAsset from './SimpleAsset'
import Vehicle from './Vehicle'
import VerticalProfile from './VerticalProfile'
import WeatherLinePlot from './WeatherLinePlot'
import PlanManager from './PlanManager'
import { fetchDomainNames } from '../../../services/DomainUtils'

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
  setSelectedWaypointIdx: (_: number) => void
  updateWpLocation: (_: ILatLng) => void
  addWpToPlan: (_: IPositionAtTime) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
  addMeasurePoint: (_: ILatLng) => void
  clearMeasure: () => void
  toggleVehicleModal: () => void
  setEditVehicle: (v: IAsset | undefined) => void
  updateVehicle: (v: IAsset) => void
  onSettingsClick: () => void
  toggleSliderChange: () => void
  setMapOverlayInfo: (m: string) => void
  setToolClickLocation: (l: ILatLng | null) => void
  updateAssets: (s: IAsset, d: string[]) => void
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

    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      this.fetchMapSettings()
    }
  }

  public async componentDidMount() {
    this.getDomains()
    if (!this.oneSecondTimer) {
      this.oneSecondTimer = window.setInterval(() => {
        this.updateCopernicusMaps()
        this.setState({ currentTime: Date.now() })
      }, 2000)
    }
    this.map = this.refs.map as LeafletMap
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
        this.onMapMeasureClick(clickLocation)
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

    if (!e.originalEvent.srcElement.className.includes('assetOptDomain')) {
      this.setAssetSelected(undefined)
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
        />
      )
    })
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
        />
      )
    })
  }

  public drawCanvas(info: any) {
    const ctx = info.canvas.getContext('2d')
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)
    ctx.fillStyle = 'rgba(255,116,0, 0.2)'
    this.props.aisShips.forEach((ship) => {
      const aisCanvas = new AISCanvas({
        perpLinesSize: this.state.perpLinesSize,
        ship,
      })
      aisCanvas.drawInCanvas(info)
    })
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
  }

  public toggleDrawAisLocations() {
    this.setState({
      isToDrawAISPolygons: !this.state.isToDrawAISPolygons,
    })
  }

  private setLeafletMapRef(map: any) {
    this.map = map
  }

  public render() {
    return (
      <>
        <LeafletMap
          ref={(m) => this.setLeafletMapRef(m)}
          fullscreenControl={true}
          center={{ lat: this.state.settings.lat, lng: this.state.settings.lng }}
          zoom={this.state.settings.zoom}
          maxZoom={20}
          onClick={this.handleMapClick}
          onMoveend={this.handleMove}
          onZoomend={this.handleZoom}
          onOverlayAdd={(evt: any) => {
            // this is done for perfomance reasons
            if (evt.name === 'AIS Data') {
              this.setState({ isAISLayerActive: true })
            } else if (evt.name === 'Vehicles') {
              this.setState({ isVehiclesLayerActive: true })
            } else if (evt.name.startsWith('Copernicus')) {
              this.props.setMapOverlayInfo(evt.name)
              const url = MapUtils.buildLegendURL(evt.layer)
              this.setState({
                activeLegend: <img className="mapLegend" src={url} alt="Map legend" />,
              })
              return
            }
          }}
          onOverlayRemove={(evt: any) => {
            if (evt.name === 'AIS Data') {
              this.setState({ isAISLayerActive: false })
            } else if (evt.name === 'Vehicles') {
              this.setState({ isVehiclesLayerActive: false })
            } else if (evt.name.startsWith('Copernicus')) {
              this.setState({
                activeLegend: <></>,
              })
              this.props.setMapOverlayInfo('')
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
            <Overlay name="EMODNET Bathymetry">
              <WMSTileLayer
                url="https://ows.emodnet-bathymetry.eu/wms"
                layers="mean_multicolour"
                format="image/png"
                // styles="boxfill/sst_36"
                // transparent={true}
                // colorscalerange="0,36"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.5}
                attribution="EMODNET"
              />
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
            <Overlay name="Copernicus SST">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024"
                layers="thetao"
                format="image/png"
                styles="boxfill/sst_36"
                transparent={true}
                colorscalerange="0,36"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Copernicus SSSC">
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
            <Overlay name="Copernicus SSV">
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
            <Overlay name="Copernicus ZOS">
              <WMSTileLayer
                url="http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024"
                layers="zos"
                format="image/png"
                styles="boxfill/rainbow"
                transparent={true}
                colorscalerange="-1,1"
                belowmincolor="extend"
                belowmaxcolor="extend"
                opacity={0.8}
                attribution="E.U. Copernicus Marine Service Information"
              />
            </Overlay>
            <Overlay name="Copernicus CHL">
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
            <Overlay name="Copernicus Waves">
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
            <Overlay name="Copernicus Wind">
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
            <Overlay name="Copernicus SLA">
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
            {this.buildMyMaps()}
            {this.buildGeoLayers()}
            <Overlay checked={true} name="Vehicles">
              <LayerGroup>{this.buildVehicles()}</LayerGroup>
              {this.buildEditVehicleModal()}
            </Overlay>
            {this.props.auth.authenticated && this.map && (
              <Overlay checked={true} name="Plans">
                <LayerGroup>
                  <PlanManager mapRef={this.map} />
                </LayerGroup>
              </Overlay>
            )}
            <Overlay checked={true} name="Spots">
              <LayerGroup>{this.buildSpots()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="CCUS">
              <LayerGroup>{this.buildCcus()}</LayerGroup>
            </Overlay>
            <Overlay checked={this.state.isAISLayerActive} name="AIS Data">
              <LayerGroup>
                {this.buildAisShips()}
                <CanvasLayer drawMethod={this.drawCanvas} />
              </LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Profiles Data">
              <LayerGroup>{this.buildProfiles()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Current Location">
              <LayerGroup>{this.buildUsersLocations()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Measure track">
              <LayerGroup>{this.buildMeasureTrack()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Annotations">
              <LayerGroup>{this.buildAnnotations()}</LayerGroup>
            </Overlay>
          </LayersControl>
          {this.buildNewAnnotationMarker()}
          {this.buildToolpickMarker()}
          {this.buildDomainDialog()}
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
      <Marker key={'marker_' + i} icon={this.blueCircleIcon} position={location} />
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
  }
}

const actionCreators = {
  addWpToPlan,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  updateWpLocation,
  addMeasurePoint,
  clearMeasure,
  toggleVehicleModal,
  setEditVehicle,
  setMapOverlayInfo,
  setToolClickLocation,
  updateVehicle,
  toggleSliderChange,
}

export default connect(mapStateToProps, actionCreators)(RipplesMap)
