import React, { Component } from 'react'
import { Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import {
  setEditVehicle,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
} from '../../../redux/ripples.actions'
import DateService from '../../../services/DateUtils'
import PositionService from '../../../services/PositionUtils'

interface PropsType {
  data: IAsset
  icon: L.Icon
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
}

/**
 * Simple Asset represents a system that does not execute plans.
 * Ex: Spot, CCU
 */
class SimpleAsset extends Component<PropsType, {}> {
  private positionService: PositionService = new PositionService()
  constructor(props: PropsType) {
    super(props)
    this.onMarkerClick = this.onMarkerClick.bind(this)
  }
  public render() {
    const spot = this.props.data
    const systemPositon = this.positionService.getLatLng(spot.lastState)
    return <Marker position={systemPositon} icon={this.props.icon} onClick={this.onMarkerClick} />
  }

  private onMarkerClick(evt: any) {
    const asset = this.props.data
    evt.originalEvent.view.L.DomEvent.stopPropagation(evt)

    this.props.setSidePanelTitle(this.props.data.name)
    this.props.setSidePanelContent({
      Date: DateService.timestampSecToReadableDate(asset.lastState.timestamp),
      Lat: asset.lastState.latitude.toFixed(5),
      Lng: asset.lastState.longitude.toFixed(5),
    })
    this.props.setSidePanelVisibility(true)
    this.props.setEditVehicle(undefined)
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

export default connect(
  null,
  actionCreators
)(SimpleAsset)
