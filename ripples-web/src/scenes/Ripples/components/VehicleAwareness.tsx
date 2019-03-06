import React, { Component } from 'react'
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints } from '../../../services/PositionUtils';
import { timestampFromDeltaHours } from '../../../services/DateUtils'

export default class VehicleAwareness extends Component { 
    constructor(props){
        super(props)
    }

    estimatedPositionAtTime(){
        const date = timestampFromDeltaHours(this.props.deltaHours)
        const pair = getPrevAndNextPoints(this.props.positions, date);
        return interpolateTwoPoints(date, pair.prev, pair.next)
    }

    render() {
        return (
        <EstimatedPosition 
            vehicle={this.props.vehicle}
            position={estimatedPositionAtTime()}>
        </EstimatedPosition>
        )
        
    }
}