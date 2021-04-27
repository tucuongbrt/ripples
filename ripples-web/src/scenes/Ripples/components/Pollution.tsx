import React, { Component } from 'react'
import { Circle, Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import IPollution from '../../../model/IPollution'
import * as L from 'leaflet'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { BlueCircleIcon, GreenCircleIcon, YellowCircleIcon, RedCircleIcon } from './Icons'

interface PropsType {
  locationSelected?: {
    latitude: any
    longitude: any
  }
  pollutionMarkers?: IPollution[]
  pollutionOpen: IPollution[]

  addCircle: (pollution: IPollution) => void
  removeCircle: (pollution: IPollution) => void
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
}

class Pollution extends Component<PropsType, {}> {
  public buildPollutionMarkers() {
    if (this.props.pollutionMarkers) {
      return this.props.pollutionMarkers.map((p, index) => {
        const point = new L.LatLng(p.latitude, p.longitude)
        let color = ''
        let icon: L.Icon
        switch (p.status) {
          case 'SYNC':
            color = 'orange'
            icon = new YellowCircleIcon()
            break
          case 'EXEC':
            color = 'yellow'
            icon = new YellowCircleIcon()
            break
          case 'DONE':
            color = 'green'
            icon = new GreenCircleIcon()
            break
          default:
            color = 'red'
            icon = new RedCircleIcon()
            break
        }
        if (this.props.pollutionOpen.includes(p)) {
          return (
            <Circle
              key={'pollutionCircle_' + index}
              center={[point.lat, point.lng]}
              fillColor={color}
              color={color}
              radius={p.radius}
              onclick={() => this.props.removeCircle(p)}
            />
          )
        } else {
          return (
            <Marker
              key={'pollutionMarker_' + index}
              position={[point.lat, point.lng]}
              icon={icon}
              onClick={() => this.props.addCircle(p)}
            />
          )
        }
      })
    }
  }

  public buildSelectedLocation() {
    if (this.props.locationSelected) {
      return (
        <Marker
          position={[this.props.locationSelected.latitude, this.props.locationSelected.longitude]}
          icon={new BlueCircleIcon()}
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
