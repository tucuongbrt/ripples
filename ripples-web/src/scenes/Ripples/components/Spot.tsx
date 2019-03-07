import React, { Component } from 'react'
import { Marker, Popup} from 'react-leaflet'
import {timestampSecToReadableDate} from '../../../services/DateUtils'
import { SpotIcon } from './Icons';
import { getLatLng } from '../../../services/PositionUtils';
import IAsset from '../../../model/IAsset';


type propsType = {
    data: IAsset
}

export default class Spot extends Component<propsType, {}> {

    render(){
        let spot = this.props.data
        let systemPositon = getLatLng(spot.lastState)
        return (
            <Marker position={systemPositon} icon={new SpotIcon()}>
                <Popup>
                    <h3>{spot.name}</h3>
                    <span>Date: {timestampSecToReadableDate(spot.lastState.timestamp)}</span>
                </Popup>
            </Marker>        
        );
    }
}