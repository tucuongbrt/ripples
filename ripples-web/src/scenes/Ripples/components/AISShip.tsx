import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import { AISOrangeShipIcon, AISGreenShipIcon, AISRedShipIcon, AISBlueShipIcon, AISAntennaIcon, AISYellowShipIcon } from './Icons'
import RotatedMarker from './RotatedMarker'
import { timeFromNow } from '../../../services/DateUtils';
import IAisShip, { AisShip, IShipLocation } from '../../../model/IAisShip';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import AssetAwareness from './AssetAwareness';
import IAssetAwareness from '../../../model/IAssetAwareness';
import { KNOTS_TO_MS, calculateNextPosition, calculateShipLocation } from '../../../services/PositionUtils';
import IPositionAtTime from '../../../model/IPositionAtTime';
const CanvasLayer = require('react-leaflet-canvas-layer');

type propsType = {
    ship: IAisShip,
    sliderValue: number
    drawLocation: boolean
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
            name: this.props.ship.name,
            positions: this.props.ship.awareness
        }
        return <AssetAwareness awareness={awareness} deltaHours={deltaHours}></AssetAwareness>
    }

    private calculatePerpLinesSize(mapZoom: number): number {
        let newLineLength = 0;
        if (mapZoom > 7) {
            newLineLength = 138598 * Math.pow(mapZoom, -2.9)
        }
        return newLineLength;
    }

    buildAisShipMarker() {
        let ship = this.props.ship;
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
        );
    }

    drawCanvas(info: any) {
        let ship = this.props.ship;
        const ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = 'rgba(255,116,0, 0.2)';
        if (this.props.drawLocation) {
            this.drawShip(info, ctx, ship)
        }
        if (ship.sog > 0.2) {
            this.drawAisLines(info, ctx, ship)
        }

    }

    /**
     * Ship design
     * ----B----
     * --P   S--
     * --|   |--
     * --|   |--
     * --L___R--
     */
    drawShip(info: any, ctx: any, ship: IAisShip) {

        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        const canvasPoints = this.shipLocationToCanvasPoints(info, ship.location);
        ctx.beginPath();
        // start in l (port-stern) and draw clockwise
        ctx.moveTo(canvasPoints.l.x, canvasPoints.l.y)
        ctx.lineTo(canvasPoints.p.x, canvasPoints.p.y)
        ctx.lineTo(canvasPoints.b.x, canvasPoints.b.y)
        ctx.lineTo(canvasPoints.s.x, canvasPoints.s.y)
        ctx.lineTo(canvasPoints.r.x, canvasPoints.r.y)
        ctx.lineTo(canvasPoints.l.x, canvasPoints.l.y)
        ctx.stroke()


    }

    shipLocationToCanvasPoints(info: any, location: IShipLocation) {
        return {
            b: info.map.latLngToContainerPoint([location.bow.latitude, location.bow.longitude]),
            p: info.map.latLngToContainerPoint([location.bowPort.latitude, location.bowPort.longitude]),
            s: info.map.latLngToContainerPoint([location.bowStarboard.latitude, location.bowStarboard.longitude]),
            l: info.map.latLngToContainerPoint([location.sternPort.latitude, location.sternPort.longitude]),
            r: info.map.latLngToContainerPoint([location.sternStarboard.latitude, location.sternStarboard.longitude]),
        }
    }

    drawAisLines(info: any, ctx: any, ship: IAisShip) {
        const speed = ship.sog * KNOTS_TO_MS
        const posIn1H = calculateNextPosition(AisShip.getPositionAtTime(ship), ship.cog, speed, 3600)
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
        let ship = this.props.ship
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