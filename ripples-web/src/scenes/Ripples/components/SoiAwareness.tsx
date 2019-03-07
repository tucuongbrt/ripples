import React, { Component } from 'react'
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints } from '../../../services/PositionUtils';
import { timestampFromDeltaHours } from '../../../services/DateUtils'
import ISoiAwareness from '../../../model/ISoiAwareness';
import ILatLngHead from '../../../model/ILatLngHead';

type propsType = {
    awareness: ISoiAwareness,
    deltaHours: number
}


export default class SoiAwareness extends Component<propsType, {}> { 
    constructor(props: propsType){
        super(props)
        this.estimatedPositionAtTime = this.estimatedPositionAtTime.bind(this)
    }

    estimatedPositionAtTime(): ILatLngHead {
        const date = timestampFromDeltaHours(this.props.deltaHours)
        const pair = getPrevAndNextPoints(this.props.awareness.positions, date);
        return interpolateTwoPoints(date, pair.prev, pair.next)
    }

    render() {
        return (
        <EstimatedPosition 
            vehicle={this.props.awareness.name}
            position={this.estimatedPositionAtTime()}>
        </EstimatedPosition>
        )
        
    }
}