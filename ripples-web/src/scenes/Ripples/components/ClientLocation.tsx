import MobileDetect from 'mobile-detect'
import React, { Component } from 'react'
import { geolocated, GeolocatedProps } from 'react-geolocated'
import { Circle, Marker } from 'react-leaflet'
import { connect } from 'react-redux'
import { IUser, IUserLocation } from '../../../model/IAuthState'
import IRipplesState from '../../../model/IRipplesState'
import { getUserLastLocation, updateUserLocation } from '../../../services/UserUtils'
import { MobileIcon, PCIcon } from './Icons'
const { NotificationManager } = require('react-notifications')

const onMobile = new MobileDetect(window.navigator.userAgent).mobile()

interface PropsType {
  authUser: IUser
  onLocationClick: (u: IUserLocation) => void
}

interface StateType {
  lastLocation?: IUserLocation
}

class ClientLocation extends Component<PropsType & GeolocatedProps, StateType> {

  public icon = onMobile ? new MobileIcon() : new PCIcon()
  private sendLocationTimer: number = 0
  private SENDER_INTERVAL = 10000 // Send client position every 10 seconds

  public constructor(props: PropsType & GeolocatedProps) {
    super(props)
    this.state = {}
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
          <Marker
            position={center}
            onClick={() => {
              if (this.state.lastLocation) {
                this.props.onLocationClick(this.state.lastLocation)
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
    await this.fetchInitialPos()
    if (!this.sendLocationTimer) {
      this.sendLocation()
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

  private async fetchInitialPos() {
    try {
      const location = await getUserLastLocation()
      if (location) {
        this.setState({ lastLocation: location })
      }
    } catch(error) {
      console.log('User does not have a saved position')
    }
  }

  private buildUserLocation() {
    if (this.props.coords) {
      const location: IUserLocation = {
        name: this.props.authUser.name,
        email: this.props.authUser.email,
        latitude: this.props.coords.latitude,
        longitude: this.props.coords.longitude,
        accuracy: this.props.coords.accuracy,
        timestamp: Date.now(),
      }
      this.setState({
        lastLocation: location,
      })
      return location
    }
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    authUser: state.auth.currentUser,
  }
}

export default connect(
  mapStateToProps,
  null
)(
  geolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    watchPosition: true,
  })(ClientLocation)
)
