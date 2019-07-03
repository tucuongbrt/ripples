import { LatLng } from 'leaflet'
import React, { Component } from 'react'
import { Polygon } from 'react-leaflet'
import { connect } from 'react-redux'
import IAisShip from '../../../model/IAisShip'
import IAssetAwareness from '../../../model/IAssetAwareness'
import IRipplesState from '../../../model/IRipplesState'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { timeFromNow } from '../../../services/DateUtils'
import AssetAwareness from './AssetAwareness'
import { AwarenessIcon, RedTriangleIcon } from './Icons'
import RotatedMarker from './RotatedMarker'

interface PropsType {
  ship: IAisShip
  sliderValue: number
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
}

class AISShip extends Component<PropsType, {}> {
  public awarenessMinSpeed: number = 0.2
  public icon = new RedTriangleIcon()
  public awarenessIcon = new AwarenessIcon()

  constructor(props: PropsType) {
    super(props)
    this.buildAisShipPolygon = this.buildAisShipPolygon.bind(this)
    this.buildAisShipMarker = this.buildAisShipMarker.bind(this)
    this.buildShipAwareness = this.buildShipAwareness.bind(this)
    this.onShipClick = this.onShipClick.bind(this)
  }

  public getOpacity(lastUpdate: number) {
    const deltaTimeSec = Math.round((Date.now() - lastUpdate) / 1000)
    return 0.36 + (1.0 - 0.36) / (1 + Math.pow(deltaTimeSec / 8000, 0.9))
  }

  public buildShipAwareness() {
    const deltaHours = this.props.sliderValue
    const awareness: IAssetAwareness = {
      name: this.props.ship.name,
      positions: this.props.ship.awareness,
    }
    return <AssetAwareness awareness={awareness} deltaHours={deltaHours} icon={this.awarenessIcon} />
  }

  public getDisplayableProperties(ship: IAisShip) {
    return {
      cog: ship.cog.toFixed(1),
      heading: ship.heading !== 511 ? ship.heading.toFixed(1) : 'not available',
      'last update': timeFromNow(ship.timestamp),
      latitude: ship.latitude.toFixed(5),
      longitude: ship.longitude.toFixed(5),
      mmssi: `<a href="https://www.marinetraffic.com/pt/ais/details/ships/${ship.mmsi}" target="_blank">${ship.mmsi.toString()}</a>`,
      'speed (knots)': ship.sog.toFixed(1),
      // tslint:disable-next-line: object-literal-sort-keys
    }
  }

  public onShipClick(evt: any, ship: IAisShip) {
    evt.originalEvent.view.L.DomEvent.stopPropagation(evt)

    this.props.setSidePanelTitle(ship.name)
    this.props.setSidePanelContent(this.getDisplayableProperties(ship))
    this.props.setSidePanelVisibility(true)
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
        rotationAngle={Math.round(ship.cog)}
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
    if (this.props.sliderValue !== 0 && ship.sog > this.awarenessMinSpeed) {
      shipAwareness = this.buildShipAwareness()
    }
    return (
      <>
        {this.buildAisShipPolygon()}
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
}

function mapStateToProps(state: IRipplesState) {
  const { sliderValue } = state
  return {
    sliderValue,
  }
}

export default connect(
  mapStateToProps,
  actionCreators
)(AISShip)
