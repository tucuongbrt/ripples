import { LatLngLiteral } from 'leaflet'
import React, { Component } from 'react'
import { FeatureGroup, GeoJSON, LayerGroup, LayersControl, Map, TileLayer } from 'react-leaflet'
import 'react-leaflet-fullscreen-control'
import { connect } from 'react-redux'
import IAisShip, { IShipLocation } from '../../../model/IAisShip'
import IAsset from '../../../model/IAsset'
import IRipplesState from '../../../model/IRipplesState'
import {
  addWpToPlan,
  setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  updateWpLocation,
} from '../../../redux/ripples.actions'
import AISShip from './AISShip'
import Spot from './Spot'
import Vehicle from './Vehicle'
const { BaseLayer, Overlay } = LayersControl
import GeoData from '../../../assets/geojson/all.json'
import ILatLng from '../../../model/ILatLng'
import IPlan from '../../../model/IPlan'
import IPositionAtTime from '../../../model/IPositionAtTime'
import IProfile from '../../../model/IProfile'
import { ToolSelected } from '../../../model/ToolSelected'
import AISCanvas from './AISCanvas'
import ClientLocation from './ClientLocation'
import VehiclePlan from './VehiclePlan'
import VerticalProfile from './VerticalProfile'
const CanvasLayer = require('react-leaflet-canvas-layer')
const toGeojson = require('@mapbox/togeojson')
const L = require('leaflet')

interface PropsType {
  aisLocations: IShipLocation[]
  vehicles: IAsset[]
  spots: IAsset[]
  aisShips: IAisShip[]
  profiles: IProfile[]
  plans: IPlan[]
  selectedPlan: IPlan
  selectedWaypointIdx: number
  toolSelected: ToolSelected
  setSelectedWaypointIdx: (_: number) => void
  updateWpLocation: (_: ILatLng) => void
  addWpToPlan: (_: IPositionAtTime) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
}

interface StateType {
  initCoords: LatLngLiteral
  isToDrawAisLocations: boolean
  perpLinesSize: number
  geojsonData: any[]
}

class RipplesMap extends Component<PropsType, StateType> {
  public upgradedOptions: any
  public initZoom = 10
  public map: any

  constructor(props: PropsType) {
    super(props)
    const initCoords = { lat: 41.18, lng: -8.7 }
    this.state = {
      geojsonData: GeoData,
      initCoords,
      isToDrawAisLocations: false,
      perpLinesSize: 10,
    }
    this.buildProfiles = this.buildProfiles.bind(this)
    this.buildVehicles = this.buildVehicles.bind(this)
    this.buildSpots = this.buildSpots.bind(this)
    this.buildAisShips = this.buildAisShips.bind(this)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleZoom = this.handleZoom.bind(this)
    this.drawCanvas = this.drawCanvas.bind(this)
    this.toggleDrawAisLocations = this.toggleDrawAisLocations.bind(this)
    this.loadKMLData = this.loadKMLData.bind(this)
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

  public loadKMLData() {
    const apiURL = process.env.REACT_APP_API_BASE_URL
    fetch(`${apiURL}/kml`)
      .then(res => res.text())
      .then(xml => {
        // Create new kml overlay
        const dom = new DOMParser().parseFromString(xml, 'text/xml')
        const featureCollection = toGeojson.kml(dom, { styles: true })
        const context = this
        L.geoJSON(featureCollection, {
          style(feature: any) {
            return {
              color: feature.properties.stroke,
              weight: feature.properties['stroke-width'],
            }
          },
          onEachFeature(feature: any, layer: any) {
            if (feature.properties && feature.properties.name) {
              layer.on('click', (evt: any) => {
                evt.originalEvent.view.L.DomEvent.stopPropagation(evt)
                context.props.setSidePanelTitle(feature.properties.name)
                context.props.setSidePanelContent(context.getGeoJSONSidePanelProperties(feature.properties))
                context.props.setSidePanelVisibility(true)
              })
            }
          },
        }).addTo(this.map.leafletElement)
        // this.map.addLayer(geojson)
      })
  }

  public componentDidMount() {
    this.loadKMLData()
  }

  public buildProfiles() {
    return this.props.profiles.map((profile, i) => {
      return <VerticalProfile key={'profile' + i} data={profile} />
    })
  }

  public buildSpots() {
    return this.props.spots.map(spot => {
      return <Spot key={spot.imcid} data={spot} />
    })
  }

  public buildPlans(): JSX.Element[] {
    return this.props.plans.map(p => {
      return <VehiclePlan key={'VehiclePlan' + p.id} plan={p} vehicle={p.assignedTo} />
    })
  }

  public buildVehicles() {
    return this.props.vehicles.map(vehicle => {
      return <Vehicle key={vehicle.imcid} data={vehicle} />
    })
  }

  public buildAisShips() {
    return this.props.aisShips.map(ship => {
      return <AISShip key={'Ship_' + ship.mmsi} ship={ship} />
    })
  }

  public drawCanvas(info: any) {
    const ctx = info.canvas.getContext('2d')
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)
    ctx.fillStyle = 'rgba(255,116,0, 0.2)'
    this.props.aisShips.forEach(ship => {
      const aisCanvas = new AISCanvas({
        drawLocation: this.state.isToDrawAisLocations,
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
        if (!this.state.isToDrawAisLocations) {
          this.toggleDrawAisLocations()
        }
      } else {
        if (this.state.isToDrawAisLocations) {
          this.toggleDrawAisLocations()
        }
      }
    }
  }

  public toggleDrawAisLocations() {
    this.setState({
      isToDrawAisLocations: !this.state.isToDrawAisLocations,
    })
  }

  public render() {
    return (
      <Map
        fullscreenControl={true}
        center={this.state.initCoords}
        zoom={this.initZoom}
        maxZoom={20}
        onClick={this.handleMapClick}
        onZoomend={this.handleZoom}
        ref={currentMap => (this.map = currentMap)}
      >
        <LayersControl position="topright">
          <BaseLayer checked={true} name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <Overlay name="Nautical charts">
            <TileLayer
              url="http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4"
              attribution="Map data &copy; Transas Nautical Charts"
              tms={true}
              maxZoom={21}
              opacity={0.7}
              maxNativeZoom={17}
            />
          </Overlay>
          <Overlay checked={true} name="Vehicles">
            <LayerGroup>{this.buildVehicles()}</LayerGroup>
          </Overlay>
          <Overlay checked={true} name="Plans">
            <LayerGroup>{this.buildPlans()}</LayerGroup>
          </Overlay>
          <Overlay checked={true} name="Spots">
            <LayerGroup>{this.buildSpots()}</LayerGroup>
          </Overlay>
          <Overlay checked={true} name="AIS Data">
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
        />
      </Map>
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
