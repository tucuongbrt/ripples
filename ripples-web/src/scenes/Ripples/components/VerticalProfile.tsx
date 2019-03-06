import React, { Component } from 'react'
import {Marker, Popup} from 'react-leaflet'
import LinePlot from './LinePlot';
import { SensorIcon } from './Icons';
import { getLatLng } from '../../../services/PositionUtils';

export default class VerticalProfile extends Component {

    render(){
        let systemPosition = getLatLng(this.props.data)
        return (
            <Marker position={systemPosition} icon={new SensorIcon()}>
                <Popup minWidth={300} maxWidth={600}>
                    <LinePlot data={this.props.data}></LinePlot>
                </Popup>
            </Marker>
        )
    }
}