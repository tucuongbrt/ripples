import React, { Component } from 'react'
import { Marker, Popup } from 'react-leaflet'
import IProfile from '../../../model/IProfile'
import { getLatLng } from '../../../services/PositionUtils'
import { SensorIcon } from './Icons'
import LinePlot from './LinePlot'

interface PropsType {
  data: IProfile
}

export default class VerticalProfile extends Component<PropsType, {}> {
  public render() {
    const systemPosition = getLatLng(this.props.data)
    return (
      <Marker position={systemPosition} icon={new SensorIcon()}>
        <Popup minWidth={300} maxWidth={600}>
          <LinePlot data={this.props.data} />
        </Popup>
      </Marker>
    )
  }
}
