import React, { Component } from 'react'
import {Marker, Popup} from 'react-leaflet'
import { getSystemPosition } from '../../../services/PositionUtils';
import LinePlot from './LinePlot';
import { SensorIcon } from './Icons';

export default class VerticalProfile extends Component {

    render(){
        return (
            <Marker position={getSystemPosition(this.props.data)} icon={new SensorIcon()}>
                <Popup minWidth={300} maxWidth={600}>
                    <LinePlot data={this.props.data}></LinePlot>
                </Popup>
            </Marker>
        )
    }
}