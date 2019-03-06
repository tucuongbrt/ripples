import React, { Component } from 'react'
import { Marker, Popup} from 'react-leaflet'
import {timestampSecToReadableDate} from '../../../services/DateUtils'
import { SpotIcon } from './Icons';
import { getLatLng } from '../../../services/PositionUtils';

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
        let systemPositon = getLatLng(spot.lastState)
        return (
            <Marker key={this.props.imcid} position={systemPositon} icon={new SpotIcon()}>
                <Popup>
                    <h3>{spot.name}</h3>
                    <span>Date: {timestampSecToReadableDate(spot.lastState.timestamp)}</span>
                </Popup>
            </Marker>        
        );
    }
}