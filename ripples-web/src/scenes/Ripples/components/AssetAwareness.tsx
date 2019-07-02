import React, { Component } from 'react'
import IAssetAwareness from '../../../model/IAssetAwareness'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import { timestampFromDeltaHours } from '../../../services/DateUtils'
import { getPrevAndNextPoints, interpolateTwoPoints } from '../../../services/PositionUtils'
import EstimatedPosition from './EstimatedPosition'

interface PropsType {
  awareness: IAssetAwareness
  deltaHours: number
  icon: any
}

export default class AssetAwareness extends Component<PropsType, {}> {
  constructor(props: PropsType) {
    super(props)
    this.estimatedPositionAtTime = this.estimatedPositionAtTime.bind(this)
  }

  public estimatedPositionAtTime(): IPosHeadingAtTime {
    const date = timestampFromDeltaHours(this.props.deltaHours)
    const pair = getPrevAndNextPoints(this.props.awareness.positions, date)
    return interpolateTwoPoints(date, pair.prev, pair.next)
  }

  public render() {
    const estimatedPos = this.estimatedPositionAtTime()
    return <EstimatedPosition vehicle={this.props.awareness.name} position={estimatedPos} icon={this.props.icon} />
  }
}
