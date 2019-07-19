import React, { Component } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { timestampSecToReadableDate } from '../../../services/DateUtils'
import { getLatLng } from '../../../services/PositionUtils'
import { SpotIcon } from './Icons'

interface PropsType {
  data: IAsset
  icon: L.Icon
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
}

/**
 * Simple Asset represents a system that does not execute plans.
 * Ex: Spot, CCU
 */
class SimpleAsset extends Component<PropsType, {}> {
  constructor(props: PropsType) {
    super(props)
    this.onMarkerClick = this.onMarkerClick.bind(this)
  }
  public render() {
    const spot = this.props.data
    const systemPositon = getLatLng(spot.lastState)
    return <Marker position={systemPositon} icon={this.props.icon} onClick={this.onMarkerClick} />
  }

  private onMarkerClick(evt: any) {
    const asset = this.props.data
    evt.originalEvent.view.L.DomEvent.stopPropagation(evt)

    this.props.setSidePanelTitle(this.props.data.name)
    this.props.setSidePanelContent({
      Date: timestampSecToReadableDate(asset.lastState.timestamp),
      Lat: asset.lastState.latitude.toFixed(5),
      Lng: asset.lastState.longitude.toFixed(5),
    })
    this.props.setSidePanelVisibility(true)
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
}

export default connect(
  null,
  actionCreators
)(SimpleAsset)
