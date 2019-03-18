import React, { Component } from 'react'
import {Popup} from 'react-leaflet'
import {timestampMsToReadableDate} from '../../../services/DateUtils'
import {AuvIcon} from './Icons'
import RotatedMarker from './RotatedMarker'
import { getLatLng } from '../../../services/PositionUtils';
import IAssetState from '../../../model/IAssetState';

type propsType = {
    lastState: IAssetState,
    name: string
    settings: Map<string, string>
}

export default class Vehicle extends Component<propsType,{}> {

    constructor(props: propsType){
        super(props);
    }

    renderSettings(settings: Map<string, string>) {
        let renderedSettings: JSX.Element[] = [];
        settings.forEach((value, key) => {
            renderedSettings.push(<li key={key}>{key}: {value}</li>)
        })
        return renderedSettings;
    }

    render() {
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
                    <h5>State</h5>
                    <ul>
                    <li>Lat: {vehicle.lastState.latitude.toFixed(5)}</li>
                    <li>Lng: {vehicle.lastState.longitude.toFixed(5)}</li>
                    <li>Fuel: {vehicle.lastState.fuel.toFixed(2)}</li>
                    <li>Heading: {vehicle.lastState.heading.toFixed(2)}</li>
                    <li>Date: {timestampMsToReadableDate(vehicle.lastState.timestamp)}</li>
                    </ul>
                    <h5>Settings</h5>
                    <ul>
                    {this.renderSettings(vehicle.settings)}
                    </ul>
                </Popup>
            </RotatedMarker>        
        );
        
    }


}