import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import { AISOrangeShipIcon, AISGreenShipIcon, AISRedShipIcon, AISBlueShipIcon, AISAntennaIcon, AISYellowShipIcon } from './Icons'
import RotatedMarker from './RotatedMarker'
import { timeFromNow } from '../../../services/DateUtils';
import IAisShip, { AisShip } from '../../../model/IAisShip';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import AssetAwareness from './AssetAwareness';
import IAssetAwareness from '../../../model/IAssetAwareness';
import { KNOTS_TO_MS, calculateNextPosition } from '../../../services/PositionUtils';
import IPositionAtTime from '../../../model/IPositionAtTime';
const CanvasLayer = require('react-leaflet-canvas-layer');

type propsType = {
    data: IAisShip,
    sliderValue: number
    perpLinesSize: number
}

class AISShip extends Component<propsType, {}> {

    awarenessMinSpeed: number = 0.2

    constructor(props: propsType) {
        super(props)
        this.buildAisShipMarker = this.buildAisShipMarker.bind(this)
        this.buildShipAwareness = this.buildShipAwareness.bind(this)
        this.drawCanvas = this.drawCanvas.bind(this)
        this.getPerpendicularLines = this.getPerpendicularLines.bind(this)
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
            name: this.props.data.name,
            positions: this.props.data.awareness
        }
        return <AssetAwareness awareness={awareness} deltaHours={deltaHours}></AssetAwareness>
    }

    buildAisShipMarker() {
        let ship = this.props.data;
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
                    </ul>
                </Popup>
            </RotatedMarker>
        );
    }

    drawCanvas(info: any) {
        let ship = this.props.data;
        
        if (this.props.data.sog > 0.2) {
            this.drawAisLines(info, ship)
        }
        

    }

    drawAisLines(info: any, ship: IAisShip) {
        const ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = 'rgba(255,116,0, 0.2)';
        let speed = ship.sog * KNOTS_TO_MS
        let posIn1H = calculateNextPosition(AisShip.getPositionAtTime(ship), ship.cog, speed, 3600)
        let pointA = info.map.latLngToContainerPoint([ship.latitude, ship.longitude])
        let pointB = info.map.latLngToContainerPoint([posIn1H.latitude, posIn1H.longitude])
        this.getPerpendicularLines(ship).forEach((line: IPositionAtTime[]) => {
            let pointA = info.map.latLngToContainerPoint([line[0].latitude, line[0].longitude])
            let pointB = info.map.latLngToContainerPoint([line[1].latitude, line[1].longitude])
            ctx.beginPath();
            ctx.moveTo(pointA.x, pointA.y);
            ctx.lineTo(pointB.x, pointB.y);
            ctx.stroke();
        })
        ctx.beginPath();
        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();
    }

    getPerpendicularLines(ship: IAisShip): IPositionAtTime[][] {
        const tenMinutes = 600
        const lines: IPositionAtTime[][] = []
        const aisCurrentPos = AisShip.getPositionAtTime(ship)
        const shipSpeed = ship.sog * KNOTS_TO_MS
        const pointBCog = ship.cog > 90 ? ship.cog - 90 : 360 + ship.cog - 90
        for (let i = 1; i <= 6; i++) {
            const time = i * tenMinutes
            const pointC = calculateNextPosition(
                aisCurrentPos,
                ship.cog,
                shipSpeed,
                time)
            const pointA = calculateNextPosition(
                pointC, (ship.cog + 90) % 360, this.props.perpLinesSize, 1)
            if (ship.cog < 90) {
                let cog = 360 - Math.abs((ship.cog - 90) % 360)
            }
            const pointB = calculateNextPosition(
                pointC, pointBCog, this.props.perpLinesSize, 1)
            lines.push([pointA, pointB])
        }
        return lines
    }


    render() {
        let ship = this.props.data
        let shipAwareness: JSX.Element | null = null
        if (this.props.sliderValue != 0 && ship.sog > this.awarenessMinSpeed) {
            shipAwareness = this.buildShipAwareness()
        }
        return (
            <>
                {this.buildAisShipMarker()}
                {shipAwareness}
                <CanvasLayer drawMethod={this.drawCanvas} />
            </>
        )

    }
}

function mapStateToProps(state: IRipplesState) {
    const { sliderValue } = state
    return {
        sliderValue: sliderValue
    }
}

export default connect(mapStateToProps, null)(AISShip)