import React, { Component } from 'react'
import { Marker, Popup} from 'react-leaflet'
import {timestampSecToReadableDate} from './DateUtils'
import {getSystemPosition} from './PositionUtils'
import { SpotIcon } from './icons/Icons';

export default class Spot extends Component {
    constructor(props){
        super(props);
        this.state = {
            lastState: props.lastState,
            name: props.name,
        };
    }
    render(){
        let spot = this.state;
        return (
            <Marker key={this.props.imcid} position={getSystemPosition(spot.lastState)} icon={new SpotIcon()}>
                <Popup>
                    <h3>{spot.name}</h3>
                    <span>Date: {timestampSecToReadableDate(spot.lastState.timestamp)}</span>
                </Popup>
            </Marker>        
        );
    }
}