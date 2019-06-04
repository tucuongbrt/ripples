import IAisShip, { AisShip, IShipLocation } from '../../../model/IAisShip';
import { KNOTS_TO_MS, calculateNextPosition } from '../../../services/PositionUtils';
import IPositionAtTime from '../../../model/IPositionAtTime';

type propsType = {
    ship: IAisShip,
    perpLinesSize: number
    drawLocation: boolean
}


export default class AISCanvas {

    props: propsType
    constructor(props: propsType) {
        this.props = props;
        this.drawInCanvas = this.drawInCanvas.bind(this)
        this.getPerpendicularLines = this.getPerpendicularLines.bind(this)
    }


    public drawInCanvas(info: any) {
        let ship = this.props.ship;
        const ctx = info.canvas.getContext('2d');
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
    private drawShip(info: any, ctx: any, ship: IAisShip) {
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

    private shipLocationToCanvasPoints(info: any, location: IShipLocation) {
        return {
            b: info.map.latLngToContainerPoint([location.bow.latitude, location.bow.longitude]),
            p: info.map.latLngToContainerPoint([location.bowPort.latitude, location.bowPort.longitude]),
            s: info.map.latLngToContainerPoint([location.bowStarboard.latitude, location.bowStarboard.longitude]),
            l: info.map.latLngToContainerPoint([location.sternPort.latitude, location.sternPort.longitude]),
            r: info.map.latLngToContainerPoint([location.sternStarboard.latitude, location.sternStarboard.longitude]),
        }
    }

    private drawAisLines(info: any, ctx: any, ship: IAisShip) {
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

    private getPerpendicularLines(ship: IAisShip): IPositionAtTime[][] {
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
            }
            const pointB = calculateNextPosition(
                pointC, pointBCog, this.props.perpLinesSize, 1)
            lines.push([pointA, pointB])
        }
        return lines
    }

}

