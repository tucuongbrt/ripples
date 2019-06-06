import React, { Component } from 'react'
import { Popup, Polygon} from 'react-leaflet'
import { AISOrangeShipIcon, AISGreenShipIcon, AISRedShipIcon, AISBlueShipIcon, AISAntennaIcon, AISYellowShipIcon } from './Icons'
import RotatedMarker from './RotatedMarker'
import { timeFromNow } from '../../../services/DateUtils';
import IAisShip, { AisShip } from '../../../model/IAisShip';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import AssetAwareness from './AssetAwareness';
import IAssetAwareness from '../../../model/IAssetAwareness';
import { LatLng } from 'leaflet';
import { setSidePanelTitle, setSidePanelContent } from '../../../redux/ripples.actions';

type propsType = {
    ship: IAisShip,
    sliderValue: number
    setSidePanelTitle: (title: string) => void
    setSidePanelContent: (content: Map<string, string>) => void
}


class AISShip extends Component<propsType, {}> {

    awarenessMinSpeed: number = 0.2

    constructor(props: propsType) {
        super(props)
        this.buildAisShipMarker = this.buildAisShipMarker.bind(this)
        this.buildShipAwareness = this.buildShipAwareness.bind(this)
        this.onShipClick = this.onShipClick.bind(this)
    }

    getIcon(type: number) {
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

    getOpacity(lastUpdate: number) {
        let deltaTimeSec = Math.round((Date.now() - lastUpdate) / 1000);
        return 0.36 + (1.000 - 0.36) / (1 + Math.pow((deltaTimeSec / 8000), 0.9))
    }

    buildShipAwareness() {
        const deltaHours = this.props.sliderValue
        const awareness: IAssetAwareness = {
            name: this.props.ship.name,
            positions: this.props.ship.awareness
        }
        return <AssetAwareness awareness={awareness} deltaHours={deltaHours}></AssetAwareness>
    }

    getDisplayableProperties(ship: IAisShip) {
        return new Map<string, string>(
            [
                ["mmssi", ship.mmsi],
                ["last update", timeFromNow(ship.timestamp)],
                ["latitude", ship.latitude.toFixed(5)],
                ["longitude", ship.longitude.toFixed(5)],
                ["speed (knots)", ship.sog.toFixed(1)],
                ["cog", ship.cog.toFixed(1)],
                ["heading", ship.heading != 511 ? ship.heading.toFixed(1) : "not available"]
            ]
        )
    }

    onShipClick(ship: IAisShip) {
        this.props.setSidePanelTitle(ship.name)
        this.props.setSidePanelContent(this.getDisplayableProperties(ship))
    }

    buildAisShipMarker() {
        const ship = this.props.ship;
        const location = ship.location;
        let positions = [
            new LatLng(location.bow.latitude, location.bow.longitude),
            new LatLng(location.bowPort.latitude, location.bowPort.longitude),
            new LatLng(location.sternPort.latitude, location.sternPort.longitude),
            new LatLng(location.sternStarboard.latitude, location.sternStarboard.longitude),
            new LatLng(location.bowStarboard.latitude, location.bowStarboard.longitude)
        ] 
        return <Polygon positions={positions} color="red" onClick={() => this.onShipClick(ship)}>

        </Polygon>

        /*

        return (
            <RotatedMarker
                position={{ lat: ship.latitude, lng: ship.longitude }}
                rotationAngle={Math.round(ship.cog)}
                rotationOrigin={'center'}
                icon={this.getIcon(Number(ship.type))}
                opacity={this.getOpacity(ship.timestamp)}>
                <Popup>
                    <h3>{ship.name} - {ship.mmsi}</h3>
                    <ul>
                        <li>Lat: {ship.latitude.toFixed(5)}</li>
                        <li>Lng: {ship.longitude.toFixed(5)}</li>
                        <li>Heading: {ship.heading.toFixed(1)}</li>
                        <li>Cog: {ship.cog.toFixed(1)}</li>
                        <li>Sog: {(ship.sog).toFixed(1)} knots</li>
                        <li>Type: {ship.type}</li>
                        <li>Last update: {timeFromNow(ship.timestamp)}</li>
                        <li>Port: {ship.port}m</li>
                        <li>Starboard: {ship.starboard}m</li>
                        <li>Bow: {ship.bow}m</li>
                        <li>Stern: {ship.stern}m</li>
                    </ul>
                </Popup>
            </RotatedMarker>
        );*/
    }


    render() {
        let ship = this.props.ship
        let shipAwareness: JSX.Element | null = null
        if (this.props.sliderValue != 0 && ship.sog > this.awarenessMinSpeed) {
            shipAwareness = this.buildShipAwareness()
        }
        return (
            <>
                {this.buildAisShipMarker()}
                {shipAwareness}
            </>
        )

    }
}

const actionCreators = {
    setSidePanelTitle,
    setSidePanelContent,
}

function mapStateToProps(state: IRipplesState) {
    const { sliderValue } = state
    return {
        sliderValue: sliderValue
    }
}

export default connect(mapStateToProps, actionCreators)(AISShip)