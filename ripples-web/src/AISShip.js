import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import { AISOrangeShipIcon, AISGreenShipIcon, AISRedShipIcon, AISBlueShipIcon } from './icons/Icons'
import RotatedMarker from './RotatedMarker'
import { timeFromNow } from './utils/DateUtils';

/**
 * AISShip should contain:
 * name
 * mmsi
 * sog
 * cog
 * latitude
 * longitude
 * updated_at
 * type
 */
export default class AISShip extends Component {


    getIcon(type) {
        switch (type) {
            case 30: // orange - fishing
                return new AISOrangeShipIcon();
            case 70: // green - general cargo or dredger
                return new AISGreenShipIcon();
            case 80: // red - oil
                return new AISRedShipIcon();
            default: // blue
                return new AISBlueShipIcon();
        }
    }

    getOpacity(lastUpdate){
        let deltaTimeSec = Math.round((Date.now() - lastUpdate)/1000);
        if (deltaTimeSec < 600){ // 10 min
            return 1
        }
        if (deltaTimeSec < 1800){
            return 0.7
        }
        return 0.5
    }

    render() {
        let ship = this.props.data;
        return (
            <RotatedMarker
                position={{ lat: ship.latitude, lng: ship.longitude }}
                rotationAngle={Math.round(ship.cog)}
                rotationOrigin={'center'}
                icon={this.getIcon(ship.type)}
                opacity={this.getOpacity(ship.updated_at)}>
                <Popup>
                    <h3>{ship.name} - {ship.mmsi}</h3>
                    <ul>
                        <li>Lat: {ship.latitude.toFixed(5)}</li>
                        <li>Lng: {ship.longitude.toFixed(5)}</li>
                        <li>Heading: {ship.heading.toFixed(1)}</li>
                        <li>Cog: {ship.cog.toFixed(1)}</li>
                        <li>Sog: {ship.sog.toFixed(1)}</li>
                        <li>Type: {ship.type}</li>
                        <li>Last update: {timeFromNow(ship.updated_at)}</li>
                    </ul>
                </Popup>
            </RotatedMarker>
        );

    }


}