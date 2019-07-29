import { LatLngLiteral } from 'leaflet'
import React, { Component } from 'react'
import { GeoJSON, LayerGroup, LayersControl, Map, TileLayer, WMSTileLayer } from 'react-leaflet'
import 'react-leaflet-fullscreen-control'
import { connect } from 'react-redux'
import IAisShip, { IShipLocation } from '../../../model/IAisShip'
import IAsset from '../../../model/IAsset'
import ILatLng from '../../../model/ILatLng'
import IMyMap from '../../../model/IMyMap'
import IPlan, { getPlanKey } from '../../../model/IPlan'
import IPositionAtTime from '../../../model/IPositionAtTime'
import IProfile from '../../../model/IProfile'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import {
  addWpToPlan,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  updateWpLocation,
} from '../../../redux/ripples.actions'
import MapUtils from '../../../services/MapUtils'
import AISCanvas from './AISCanvas'
import AISShip from './AISShip'
import ClientLocation from './ClientLocation'
import { PCIcon, SpotIcon } from './Icons'
import SimpleAsset from './SimpleAsset'
import Vehicle from './Vehicle'
import VehiclePlan from './VehiclePlan'
import VerticalProfile from './VerticalProfile'

const CanvasLayer = require('react-leaflet-canvas-layer')
const { BaseLayer, Overlay } = LayersControl
interface PropsType {
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
  myMaps: IMyMap[]
  setSelectedWaypointIdx: (_: number) => void
  updateWpLocation: (_: ILatLng) => void
  addWpToPlan: (_: IPositionAtTime) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
}

interface StateType {
  initCoords: LatLngLiteral
  isToDrawAISPolygons: boolean
  perpLinesSize: number
  currentTime: number
  isAISLayerActive: boolean
  isVehiclesLayerActive: boolean
  activeLegend: JSX.Element
}

class RipplesMap extends Component<PropsType, StateType> {
  public upgradedOptions: any
  public initZoom = 10
  public oneSecondTimer = 0

  constructor(props: PropsType) {
    super(props)
    const initCoords = { lat: 41.18, lng: -8.7 }
    this.state = {
      initCoords,
      isToDrawAISPolygons: false,
      perpLinesSize: 10,
      currentTime: Date.now(),
      isAISLayerActive: true,
      isVehiclesLayerActive: true,
      activeLegend: <></>,
    }
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleZoom = this.handleZoom.bind(this)
    this.drawCanvas = this.drawCanvas.bind(this)
    this.toggleDrawAisLocations = this.toggleDrawAisLocations.bind(this)
  }

  public async componentDidMount() {
    if (!this.oneSecondTimer) {
      this.oneSecondTimer = window.setInterval(() => {
        this.setState({ currentTime: Date.now() })
      }, 2000)
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
    this.props.setSidePanelVisibility(false)
    if (this.props.selectedPlan.id.length === 0) {
      return
    }
    const clickLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng }
    switch (this.props.toolSelected) {
      case ToolSelected.ADD: {
        this.props.addWpToPlan(Object.assign({}, clickLocation, { timestamp: 0 }))
        break
      }
      case ToolSelected.MOVE: {
        if (this.props.selectedWaypointIdx !== -1) {
          this.props.updateWpLocation(clickLocation)
          this.props.setSelectedWaypointIdx(-1)
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
    return this.props.myMaps.map(map => {
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
                  })
                }
              }}
            />
          </LayerGroup>
        </Overlay>
      )
    })
  }

  public buildProfiles() {
    return this.props.profiles.map((profile, i) => {
      return <VerticalProfile key={'profile' + i} data={profile} />
    })
  }

  public buildSpots() {
    return this.props.spots.map(spot => {
      return <SimpleAsset key={spot.imcid} data={spot} icon={new SpotIcon()} />
    })
  }

  public buildCcus() {
    return this.props.ccus.map(ccu => {
      return <SimpleAsset key={ccu.name} data={ccu} icon={new PCIcon()} />
    })
  }

  public buildPlans(): JSX.Element[] {
    return this.props.plans.map(p => {
      return <VehiclePlan key={getPlanKey(p)} plan={p} vehicle={p.assignedTo} currentTime={this.state.currentTime} />
    })
  }

  public buildVehicles() {
    return this.props.vehicles.map(vehicle => {
      return (
        <Vehicle
          key={vehicle.imcid}
          data={vehicle}
          currentTime={this.state.currentTime}
          isVehiclesLayerActive={this.state.isVehiclesLayerActive}
        />
      )
    })
  }

  public buildAisShips() {
    return this.props.aisShips.map(ship => {
      return (
        <AISShip
          key={'Ship_' + ship.mmsi}
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
    this.props.aisShips.forEach(ship => {
      const aisCanvas = new AISCanvas({
        perpLinesSize: this.state.perpLinesSize,
        ship,
      })
      aisCanvas.drawInCanvas(info)
    })
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
  }

  public toggleDrawAisLocations() {
    this.setState({
      isToDrawAISPolygons: !this.state.isToDrawAISPolygons,
    })
  }

  public render() {
    return (
      <>
        <Map
          fullscreenControl={true}
          center={this.state.initCoords}
          zoom={this.initZoom}
          maxZoom={20}
          onClick={this.handleMapClick}
          onZoomend={this.handleZoom}
          onOverlayAdd={(evt: any) => {
            // this is done for perfomance reasons
            if (evt.name === 'AIS Data') {
              this.setState({ isAISLayerActive: true })
            } else if (evt.name === 'Vehicles') {
              this.setState({ isVehiclesLayerActive: true })
            } else if (evt.name.startsWith('Copernicus')) {
              const url = MapUtils.buildLegendURL(evt.layer)
              this.setState({
                activeLegend: <img className="mapLegend" src={url} alt="Map legend" />,
              })
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
            <Overlay name="Argos">
              <WMSTileLayer
                url="http://www.ifremer.fr/services/wms/coriolis/co_argo_floats_activity"
                layers="StationProject"
                attribution="IFREMER"
                format="image/png"
                project=""
                transparent={true}
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
            <Overlay checked={true} name="Vehicles">
              <LayerGroup>{this.buildVehicles()}</LayerGroup>
            </Overlay>
            <Overlay checked={true} name="Plans">
              <LayerGroup>{this.buildPlans()}</LayerGroup>
            </Overlay>
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
              <LayerGroup>
                <ClientLocation />
              </LayerGroup>
            </Overlay>
          </LayersControl>
        </Map>
        {this.state.activeLegend}
      </>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    aisLocations: state.assets.aisDrawableLocations,
    aisShips: state.assets.aisShips,
    plans: state.planSet,
    profiles: state.profiles,
    selectedPlan: state.selectedPlan,
    selectedWaypointIdx: state.selectedWaypointIdx,
    spots: state.assets.spots,
    ccus: state.assets.ccus,
    toolSelected: state.toolSelected,
    vehicles: state.assets.vehicles,
  }
}

const actionCreators = {
  addWpToPlan,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  updateWpLocation,
}

export default connect(
  mapStateToProps,
  actionCreators
)(RipplesMap)
