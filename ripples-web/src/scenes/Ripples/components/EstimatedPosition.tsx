import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import DateService from '../../../services/DateUtils'
import PositionService from '../../../services/PositionUtils'
import RotatedMarker from './RotatedMarker'

interface PropsType {
  vehicle: string
  position: IPosHeadingAtTime
  icon: L.Class
  rotationAngle: number
}
export default class EstimatedPosition extends Component<PropsType, {}> {
  private positionService: PositionService = new PositionService()

  public render() {
    const estimatedPos = this.props.position
    return (
      <RotatedMarker
        key={'estimated_' + this.props.vehicle}
        rotationAngle={this.props.rotationAngle}
        rotationOrigin={'center'}
        position={this.positionService.getLatLng(estimatedPos)}
        icon={this.props.icon}
        opacity={0.7}
      >
        <Popup>
          <h3>Estimated Position of {this.props.vehicle}</h3>
          <ul>
            <li>Lat: {estimatedPos.latitude.toFixed(5)}</li>
            <li>Lng: {estimatedPos.longitude.toFixed(5)}</li>
            <li>Date: {DateService.timestampMsToReadableDate(estimatedPos.timestamp)}</li>
          </ul>
        </Popup>
      </RotatedMarker>
    )
  }
}
