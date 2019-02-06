import React, { Component } from 'react'
import {Marker, Popup} from 'react-leaflet'
import {getSystemPosition} from './utils/PositionUtils'
import {timestampSecToReadableDate} from './utils/DateUtils'
import {AuvIcon} from './icons/Icons'

export default class Vehicle extends Component {

    constructor(props){
        super(props);
        this.state = {
            lastState: props.lastState,
            name: props.name,
            plan: null
        };
        this.setPlan.bind(this);
    }

    setPlan(newPlan){
        this.setState({plan: newPlan});
    }

    render(){
        let vehicle = this.state;
        console.log('draw vehicle called')
        return (
            <Marker position={getSystemPosition(vehicle.lastState)} icon={new AuvIcon()}>
                <Popup>
                    <h3>{vehicle.name}</h3>
                    <ul>
                    <li>Lat: {vehicle.lastState.latitude.toFixed(5)}</li>
                    <li>Lng: {vehicle.lastState.longitude.toFixed(5)}</li>
                    <li>Fuel: {vehicle.lastState.fuel}</li>
                    <li>Heading: {vehicle.lastState.heading.toFixed(3)}</li>
                    <li>Date: {timestampSecToReadableDate(vehicle.lastState.timestamp)}</li>
                    </ul>
                </Popup>
            </Marker>        
        );
        
    }


}