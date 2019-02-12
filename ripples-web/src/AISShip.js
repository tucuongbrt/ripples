import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import { AISOrangeShipIcon, AISGreenShipIcon, AISRedShipIcon, AISBlueShipIcon, AISAntennaIcon, AISYellowShipIcon } from './icons/Icons'
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
        const tenths = Math.floor(type / 10);
        switch (tenths) {
            case 0: // antenna
                return new AISAntennaIcon();
            case 3: // orange - fishing
                return new AISOrangeShipIcon();
            case 6: // blue - passenger
                return new AISBlueShipIcon();
            case 7: // green - cargo
                return new AISGreenShipIcon();
            case 8: // red - tanker
                return new AISRedShipIcon();
            default: // yellow - others
                return new AISYellowShipIcon();
        }
    }

    getOpacity(lastUpdate){
        let deltaTimeSec = Math.round((Date.now() - lastUpdate)/1000);
        return 0.36 + (1.000 - 0.36)/(1 + Math.pow((deltaTimeSec/8000),0.9))
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