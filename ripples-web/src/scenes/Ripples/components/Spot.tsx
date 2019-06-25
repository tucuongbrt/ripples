import React, { Component } from 'react'
import { Marker, Popup } from 'react-leaflet'
import IAsset from '../../../model/IAsset'
import { timestampSecToReadableDate } from '../../../services/DateUtils'
import { getLatLng } from '../../../services/PositionUtils'
import { SpotIcon } from './Icons'

interface PropsType {
  data: IAsset
}

export default class Spot extends Component<PropsType, {}> {
  public render() {
    const spot = this.props.data
    const systemPositon = getLatLng(spot.lastState)
    return (
      <Marker position={systemPositon} icon={new SpotIcon()}>
        <Popup>
          <h3>{spot.name}</h3>
          <span>Date: {timestampSecToReadableDate(spot.lastState.timestamp)}</span>
        </Popup>
      </Marker>
    )
  }
}
