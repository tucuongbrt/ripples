import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import { timestampMsToReadableDate } from '../../../services/DateUtils'
import { getLatLng } from '../../../services/PositionUtils'
import RotatedMarker from './RotatedMarker'

interface PropsType {
  vehicle: string
  position: IPosHeadingAtTime
  icon: L.Class
}
export default class EstimatedPosition extends Component<PropsType, {}> {
  public render() {
    const estimatedPos = this.props.position
    return (
      <RotatedMarker
        key={'estimated_' + this.props.vehicle}
        rotationAngle={estimatedPos.heading}
        rotationOrigin={'center'}
        position={getLatLng(estimatedPos)}
        icon={this.props.icon}
        opacity={0.7}
      >
        <Popup>
          <h3>Estimated Position of {this.props.vehicle}</h3>
          <ul>
            <li>Lat: {estimatedPos.latitude.toFixed(5)}</li>
            <li>Lng: {estimatedPos.longitude.toFixed(5)}</li>
            <li>Date: {timestampMsToReadableDate(estimatedPos.timestamp)}</li>
          </ul>
        </Popup>
      </RotatedMarker>
    )
  }
}
