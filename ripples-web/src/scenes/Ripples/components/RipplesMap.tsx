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
import VehiclePlan from './VehiclePlan'
import VerticalProfile from './VerticalProfile'
const CanvasLayer = require('react-leaflet-canvas-layer')

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

  constructor(props: PropsType) {
    super(props)
    this.state = {
      geojsonData: GeoData,
      initCoords: { lat: 41.18, lng: -8.7 },
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

  public onEachFeature(feature: any, layer: any) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.Name) {
      let content = `<h5>${feature.properties.Name}</h5>`
      if (feature.properties.description) {
        content += feature.properties.description
      }
      layer.bindPopup(content)
    }
  }

  public buildGeoJSON() {
    return this.state.geojsonData.map((json, i) => {
      return (
        <GeoJSON
          key={'geojson' + i}
          data={json}
          onEachFeature={this.onEachFeature}
          style={(feature: any) => {
            let color
            switch (feature.properties.Name) {
              case 'PNLN':
                color = '#e5af3b'
                break
              case 'Inner Circle':
                color = '#e3e800'
                break
              case 'Outer Circle':
                color = '#961400'
                break
              default:
                color = '#48cc02'
                break
            }
            return {
              color,
              opacity: 0.5,
              weight: 2,
            }
          }}
        />
      )
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
          <Overlay name="KML" checked={true}>
            <FeatureGroup>{this.buildGeoJSON()}</FeatureGroup>
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
  setSidePanelVisibility,
  updateWpLocation,
}

export default connect(
  mapStateToProps,
  actionCreators
)(RipplesMap)
