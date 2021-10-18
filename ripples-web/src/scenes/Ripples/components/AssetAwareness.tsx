import React, { Component } from 'react'
import IAssetAwareness from '../../../model/IAssetAwareness'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import DateService from '../../../services/DateUtils'
import PositionService from '../../../services/PositionUtils'
import EstimatedPosition from './EstimatedPosition'

interface PropsType {
  awareness: IAssetAwareness
  deltaHours: number
  icon: any
  iconAngle: number
  currentTime: number // updated periodically
}

export default class AssetAwareness extends Component<PropsType, {}> {
  private positionService: PositionService = new PositionService()
  public estimatedPositionAtTime(): IPosHeadingAtTime {
    const date = DateService.timestampFromDeltaHours(this.props.currentTime, this.props.deltaHours)
    const pair = this.positionService.getPrevAndNextPoints(this.props.awareness.positions, date)
    return this.positionService.interpolateTwoPoints(date, pair.prev, pair.next)
  }

  public render() {
    const estimatedPos = this.estimatedPositionAtTime()
    if (estimatedPos.latitude !== 0 && estimatedPos.longitude !== 0) {
      return (
        <EstimatedPosition
          vehicle={this.props.awareness.name}
          position={estimatedPos}
          icon={this.props.icon}
          rotationAngle={estimatedPos.heading + this.props.iconAngle}
        />
      )
    } else {
      return <></>
    }
  }
}
