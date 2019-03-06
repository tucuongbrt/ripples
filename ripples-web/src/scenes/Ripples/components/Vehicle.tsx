import React, { Component } from 'react'
import {Popup} from 'react-leaflet'
import {timestampMsToReadableDate} from '../../../services/DateUtils'
import {AuvIcon} from './Icons'
import RotatedMarker from './RotatedMarker'
import { getLatLng } from '../../../services/PositionUtils';
import IAssetState from '../../../model/IAssetState';

type propsType = {
    lastState: IAssetState,
    name: String
}

export default class Vehicle extends Component<propsType,{}> {

    constructor(props: propsType){
        super(props);
    }


    render(){
        let vehicle = this.props;
        const systemPosition = getLatLng(vehicle.lastState)
        console.log('draw vehicle called', vehicle)
        return (
            <RotatedMarker 
            position={systemPosition}
            icon={new AuvIcon()}
            rotationAngle={0}
            rotationOrigin={'center'}>
                <Popup>
                    <h3>{vehicle.name}</h3>
                    <ul>
                    <li>Lat: {vehicle.lastState.latitude.toFixed(5)}</li>
                    <li>Lng: {vehicle.lastState.longitude.toFixed(5)}</li>
                    <li>Fuel: {vehicle.lastState.fuel}</li>
                    <li>Heading: {vehicle.lastState.heading.toFixed(3)}</li>
                    <li>Date: {timestampMsToReadableDate(vehicle.lastState.timestamp)}</li>
                    </ul>
                </Popup>
            </RotatedMarker>        
        );
        
    }


}