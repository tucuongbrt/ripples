import { LatLng } from 'leaflet'
import React, { Component } from 'react'
import { Polygon } from 'react-leaflet'
import { connect } from 'react-redux'
import IAisShip from '../../../model/IAisShip'
import IAsset from '../../../model/IAsset'
import IAssetAwareness from '../../../model/IAssetAwareness'
import IRipplesState from '../../../model/IRipplesState'
import {
  setEditVehicle,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
} from '../../../redux/ripples.actions'
import AISService from '../../../services/AISUtils'
import DateService from '../../../services/DateUtils'
import AssetAwareness from './AssetAwareness'
import { AwarenessIcon, RedTriangleIcon } from './Icons'
import RotatedMarker from './RotatedMarker'

interface PropsType {
  isToDrawAISPolygons: boolean
  ship: IAisShip
  sliderValue: number
  currentTime: number
  isAISLayerActive: boolean
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
}

class AISShip extends Component<PropsType, {}> {
  public awarenessMinSpeed: number = 0.2
  public icon = new RedTriangleIcon()
  public awarenessIcon = new AwarenessIcon()
  private aisService = new AISService()

  constructor(props: PropsType) {
    super(props)
    this.onShipClick = this.onShipClick.bind(this)
  }

  public shouldComponentUpdate(nextProps: PropsType, nextState: any) {
    return this.props.isAISLayerActive
  }

  public getOpacity(lastUpdate: number) {
    const deltaTimeSec = Math.round((Date.now() - lastUpdate) / 1000)
    return 0.36 + (1.0 - 0.36) / (1 + Math.pow(deltaTimeSec / 8000, 0.9))
  }

  public buildShipAwareness() {
    if (this.props.ship.timestamp > Date.now() - 5000) {
      return <></>
    }
    const deltaHours = this.props.sliderValue
    const awareness: IAssetAwareness = {
      name: this.props.ship.name,
      positions: this.props.ship.awareness,
    }
    return (
      <AssetAwareness
        awareness={awareness}
        deltaHours={deltaHours}
        icon={this.icon}
        iconAngle={0}
        currentTime={this.props.currentTime}
      />
    )
  }

  public getDisplayableProperties(ship: IAisShip) {
    let properties = {
      cog: ship.cog !== 360 ? ship.cog.toFixed(1) : 'not available',
      type: this.aisService.getShipTypeAsString(ship.type) + ` (${ship.type})`,
      heading: ship.heading !== 511 ? ship.heading.toFixed(1) : 'not available',
      'last update': DateService.timeFromNow(ship.timestamp),
      latitude: ship.latitude.toFixed(5),
      longitude: ship.longitude.toFixed(5),
      mmssi: `<a href="https://www.marinetraffic.com/pt/ais/details/ships/${
        ship.mmsi
      }" target="_blank">${ship.mmsi.toString()}</a>`,
      'speed (knots)': ship.sog.toFixed(1),
      length: ship.bow + ship.stern + 'm',
      width: ship.port + ship.starboard + 'm',
      draught: ship.draught + 'm',
    }
    if (ship.dest != null && ship.dest !== '') {
      properties = Object.assign({}, properties, { dest: ship.dest })
    }
    if (ship.eta != null && ship.eta !== '00-00 00:00') {
      properties = Object.assign({}, properties, { eta: ship.eta })
    }
    return properties
  }

  public onShipClick(evt: any, ship: IAisShip) {
    evt.originalEvent.view.L.DomEvent.stopPropagation(evt)
    this.props.setSidePanelTitle(ship.name)
    this.props.setSidePanelContent(this.getDisplayableProperties(ship))
    this.props.setSidePanelVisibility(true)
    this.props.setEditVehicle(undefined)
  }

  public buildAisShipPolygon() {
    const ship = this.props.ship
    const location = ship.location
    const positions = [
      new LatLng(location.bow.latitude, location.bow.longitude),
      new LatLng(location.bowPort.latitude, location.bowPort.longitude),
      new LatLng(location.sternPort.latitude, location.sternPort.longitude),
      new LatLng(location.sternStarboard.latitude, location.sternStarboard.longitude),
      new LatLng(location.bowStarboard.latitude, location.bowStarboard.longitude),
    ]
    return <Polygon positions={positions} color="red" onClick={(e: any) => this.onShipClick(e, ship)} />
  }

  public buildAisShipMarker() {
    const ship = this.props.ship
    return (
      <RotatedMarker
        position={{ lat: ship.latitude, lng: ship.longitude }}
        rotationAngle={Math.round(ship.heading !== 511 ? ship.heading : ship.cog)}
        rotationOrigin={'center'}
        icon={this.icon}
        opacity={this.getOpacity(ship.timestamp)}
        onClick={(e: any) => this.onShipClick(e, ship)}
      />
    )
  }

  public render() {
    const ship = this.props.ship
    let shipAwareness: JSX.Element | null = null
    let shipPolygon: JSX.Element | null = null
    if (ship.sog > this.awarenessMinSpeed && ship.awareness.length > 0) {
      shipAwareness = this.buildShipAwareness()
    }
    if (this.props.isToDrawAISPolygons) {
      shipPolygon = this.buildAisShipPolygon()
    }
    return (
      <>
        {shipPolygon}
        {this.buildAisShipMarker()}
        {shipAwareness}
      </>
    )
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

function mapStateToProps(state: IRipplesState) {
  const { sliderValue } = state
  return {
    sliderValue,
  }
}

export default connect(mapStateToProps, actionCreators)(AISShip)
