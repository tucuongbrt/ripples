import React, { Component } from 'react'
import { GhostIcon } from './Icons'
import RotatedMarker from './RotatedMarker';
import {Popup} from 'react-leaflet'
import { getLatLng } from '../../../services/PositionUtils';
import IPositionAtTime from '../../../model/IPositionAtTime';
import IPosHeadingAtTime from '../../../model/ILatLngHead';
import { timestampMsToReadableDate } from '../../../services/DateUtils';

type propsType = {
    vehicle: string
    position: IPosHeadingAtTime
}
export default class EstimatedPosition extends Component<propsType, {}> { 
    render() {
        const estimatedPos = this.props.position;
        return (
                <RotatedMarker 
                key={"estimated_"+this.props.vehicle}
                rotationAngle={estimatedPos.heading}
                rotationOrigin={'center'}
                position={getLatLng(estimatedPos)}
                icon={new GhostIcon()}
                opacity={0.7}>
                    <Popup>
                        <h3>Estimated Position of {this.props.vehicle}</h3>
                        <ul>
                            <li>Lat: {estimatedPos.latitude.toFixed(5)}</li>
                            <li>Lng: {estimatedPos.longitude.toFixed(5)}</li>
                            <li>Date: {timestampMsToReadableDate(estimatedPos.timestamp)}</li>
                        </ul>
                    </Popup>
                </RotatedMarker>
        )
    }
}