import React, { Component } from 'react'
import { FeatureGroup, Popup, Marker } from 'react-leaflet'
// @ts-ignore
import { EditControl } from 'react-leaflet-draw'
import { WaypointIcon } from './Icons'
import { LatLng } from 'leaflet'
import DateService from '../../../services/DateUtils'
import IPositionAtTime from '../../../model/IPositionAtTime'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import {
  setSidePanelTitle,
  setSidePanelContent,
  setSidePanelVisibility,
  setEditVehicle,
} from '../../../redux/ripples.actions'

interface PropsType {
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
}

interface StateType {
  polygons: LatLng[][]
  onEditMode: boolean
}

/**
 * Polygon editor template snippet
 * adapted from https://github.com/alex3165/react-leaflet-draw
 */
class PolygonEditor extends Component<PropsType, StateType> {
  public constructor(props: any) {
    super(props)
    this.state = {
      polygons: [],
      onEditMode: false,
    }
  }

  _editableFG = null

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

  handleMarkerClick(i: number): any {
    const { setSidePanelTitle, setSidePanelVisibility, setEditVehicle } = this.props
    setSidePanelTitle(`Waypoint ${i} of plano_teste`)
    // setSidePanelContent(this.getWaypointSidePanelProperties(plan.waypoints[i]))
    setSidePanelVisibility(true)
    setEditVehicle(undefined)
  }

  buildWaypoints = (polygon: LatLng[]) => {
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

  public getWaypointSidePanelProperties(wp: IPositionAtTime) {
    return {
      eta: wp.timestamp ? DateService.timeFromNow(wp.timestamp) : 'N/D',
      'exact eta': wp.timestamp ? DateService.timestampMsToReadableDate(wp.timestamp) : 'N/D',
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
    }
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
    const { polygons } = this.state

    let waypoints = []

    switch (e.layerType) {
      case 'polyline':
        waypoints = e.layer._latlngs
        console.log('_onCreated: polyline created:')
        break
      case 'polygon':
        waypoints = e.layer._latlngs[0]
        console.log('_onCreated: polygon created', e)
        break
      default:
        console.log(e)
        break
    }

    // Store polygon waypoints
    this.setState({
      polygons: [...polygons, waypoints],
    })

    this._onChange()
  }

  _onDeleted = (e: any) => {
    let numDeleted = 0
    e.layers.eachLayer(() => {
      numDeleted += 1
    })
    console.log(`onDeleted: removed ${numDeleted} layers`, e)

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
    // populate FeatureGroup with the geojson layers

    /*let leafletGeoJSON = new L.GeoJSON(getGeoJson())
    let leafletFG = reactFGref.leafletElement

    leafletGeoJSON.eachLayer((layer) => {
      leafletFG.addLayer(layer)
    })*/

    this._editableFG = reactFGref
  }

  _onChange = () => {
    if (this._editableFG) {
      // @ts-ignore
      const geojsonData = this._editableFG.leafletElement.toGeoJSON()
      console.log('geojson changed', geojsonData)
    }
  }

  render() {
    const { polygons, onEditMode } = this.state
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
          }}
        />
        {!onEditMode && polygons.map((p: LatLng[]) => this.buildWaypoints(p))}
      </FeatureGroup>
    )
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

export default connect(null, actionCreators)(PolygonEditor)
