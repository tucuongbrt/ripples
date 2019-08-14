import React, { Component } from 'react'
import { geolocated, GeolocatedProps } from 'react-geolocated'
import { Circle, Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import { IUserLocation } from '../../../model/IAuthState'
import IRipplesState from '../../../model/IRipplesState'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { updateUserLocation } from '../../../services/AuthUtils'
import { PCIcon } from './Icons'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  authenticatedUserEmail: string
  setSidePanelContent: (_: any) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelVisibility: (_: boolean) => void
  onLocationClick: (u: IUserLocation) => void
}

class ClientLocation extends Component<PropsType & GeolocatedProps> {
  public icon = new PCIcon()
  private sendLocationTimer: number = 0
  private SENDER_INTERVAL = 10000 // Send client position every 10 seconds

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
          <Marker
            position={center}
            onClick={() => {
              const location = this.buildUserLocation()
              if (location) {
                this.props.onLocationClick(location)
              }
            }}
            icon={this.icon}
          />
          <Circle center={center} radius={this.props.coords.accuracy} />
        </>
      )
    }
    return <></>
  }

  public async componentDidMount() {
    if (!this.sendLocationTimer) {
      this.sendLocationTimer = window.setInterval(() => {
        this.sendLocation()
      }, this.SENDER_INTERVAL)
    }
  }

  public componentWillUnmount() {
    clearInterval(this.sendLocationTimer)
  }

  private async sendLocation() {
    const location = this.buildUserLocation()
    if (location) {
      try {
        await updateUserLocation(location)
      } catch (error) {
        console.error(error.message)
      }
    }
  }

  private buildUserLocation() {
    if (this.props.coords) {
      return {
        email: this.props.authenticatedUserEmail,
        latitude: this.props.coords.latitude,
        longitude: this.props.coords.longitude,
        accuracy: this.props.coords.accuracy,
      }
    }
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    authenticatedUserEmail: state.auth.currentUser.email,
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
}

export default connect(
  mapStateToProps,
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
