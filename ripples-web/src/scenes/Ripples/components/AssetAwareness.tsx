import React, { Component } from 'react'
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints } from '../../../services/PositionUtils';
import { timestampFromDeltaHours } from '../../../services/DateUtils'
import IAssetAwareness from '../../../model/IAssetAwareness';
import IPosHeadingAtTime from '../../../model/ILatLngHead';

type propsType = {
    awareness: IAssetAwareness,
    deltaHours: number
}


export default class AssetAwareness extends Component<propsType, {}> { 
    constructor(props: propsType){
        super(props)
        this.estimatedPositionAtTime = this.estimatedPositionAtTime.bind(this)
    }

    estimatedPositionAtTime(): IPosHeadingAtTime {
        const date = timestampFromDeltaHours(this.props.deltaHours)
        const pair = getPrevAndNextPoints(this.props.awareness.positions, date);
        return interpolateTwoPoints(date, pair.prev, pair.next)
    }

    render() {
        let estimatedPos = this.estimatedPositionAtTime()
        console.log(estimatedPos)
        return (
        <EstimatedPosition 
            vehicle={this.props.awareness.name}
            position={estimatedPos}>
        </EstimatedPosition>
        )
        
    }
}