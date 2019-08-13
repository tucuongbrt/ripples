import React, { Component } from 'react'
import { geolocated, GeolocatedProps } from 'react-geolocated'
import { Circle, Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { PCIcon } from './Icons'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  setSidePanelContent: (_: any) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelVisibility: (_: boolean) => void
}

class ClientLocation extends Component<PropsType & GeolocatedProps> {
  public icon = new PCIcon()

  constructor(props: PropsType & GeolocatedProps) {
    super(props)
    this.onCurrentLocationClick = this.onCurrentLocationClick.bind(this)
  }

  public render() {
    if (this.props.coords) {
      const center = {
        lat: this.props.coords.latitude,
        lng: this.props.coords.longitude,
      }
      return !this.props.isGeolocationAvailable ? (
        NotificationManager.warning('Your browser does not support Geolocation')
      ) : !this.props.isGeolocationEnabled ? (
        NotificationManager.warning('Geolocation is not enabled')
      ) : (
        <>
          <Marker position={center} onClick={this.onCurrentLocationClick} icon={this.icon} />
          <Circle center={center} radius={this.props.coords.accuracy} />
        </>
      )
    }
    return <></>
  }

  private onCurrentLocationClick() {
    if (this.props.coords) {
      this.props.setSidePanelTitle('Current Location')
      this.props.setSidePanelContent({
        Accuracy: this.props.coords.accuracy + 'm',
        Latitude: this.props.coords.latitude.toFixed(5),
        Longitude: this.props.coords.longitude.toFixed(5),
      })
      this.props.setSidePanelVisibility(true)
    }
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
)(
  geolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    watchPosition: true,
  })(ClientLocation)
)
