import React, { Component } from 'react'
import { Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import IPollution from '../../../model/IPollution'
import * as L from 'leaflet'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { BlueCircleIcon, StartWaypointIcon } from './Icons'

interface PropsType {
  locationSelected?: {
    latitude: any
    longitude: any
  }
  pollutionMarkers?: IPollution[]
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
}

class Pollution extends Component<PropsType, {}> {
  public buildPollutionMarkers() {
    if (this.props.pollutionMarkers) {
      return this.props.pollutionMarkers.map((p, index) => {
        const point = new L.LatLng(p.latitude, p.longitude)
        return (
          <Marker
            key={'pollution_' + index}
            position={[point.lat, point.lng]}
            icon={new BlueCircleIcon()}
            onClick={() => this.onMarkerClick(p)}
          />
        )
      })
    }
  }

  private onMarkerClick(marker: IPollution) {
    this.props.setSidePanelTitle(new Date(marker.timestamp).toDateString())
    this.props.setSidePanelContent({
      Description: marker.description,
    })
    this.props.setSidePanelVisibility(true)
  }

  public buildSelectedLocation() {
    if (this.props.locationSelected) {
      return (
        <Marker
          position={[this.props.locationSelected.latitude, this.props.locationSelected.longitude]}
          icon={new StartWaypointIcon()}
        />
      )
    }
  }

  public render() {
    return (
      <>
        {this.buildPollutionMarkers()}
        {this.buildSelectedLocation()}
      </>
    )
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
}

export default connect(null, actionCreators)(Pollution)
