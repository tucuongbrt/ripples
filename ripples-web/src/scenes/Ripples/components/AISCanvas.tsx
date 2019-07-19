import IAisShip, { AisShip, IShipLocation } from '../../../model/IAisShip'
import IPositionAtTime from '../../../model/IPositionAtTime'
import { calculateNextPosition, KNOTS_TO_MS } from '../../../services/PositionUtils'

interface PropsType {
  ship: IAisShip
  perpLinesSize: number
}

export default class AISCanvas {
  public props: PropsType
  constructor(props: PropsType) {
    this.props = props
    this.drawInCanvas = this.drawInCanvas.bind(this)
    this.getPerpendicularLines = this.getPerpendicularLines.bind(this)
  }

  public drawInCanvas(info: any) {
    const ship = this.props.ship
    const ctx = info.canvas.getContext('2d')
    if (ship.sog > 0.2) {
      this.drawAisLines(info, ctx, ship)
    }
  }

  private drawAisLines(info: any, ctx: any, ship: IAisShip) {
    const speed = ship.sog * KNOTS_TO_MS
    const posIn1H = calculateNextPosition(AisShip.getPositionAtTime(ship), ship.cog, speed, 3600)
    const pointA = info.map.latLngToContainerPoint([ship.latitude, ship.longitude])
    const pointB = info.map.latLngToContainerPoint([posIn1H.latitude, posIn1H.longitude])
    this.getPerpendicularLines(ship).forEach((line: IPositionAtTime[]) => {
      const startPoint = info.map.latLngToContainerPoint([line[0].latitude, line[0].longitude])
      const endPoint = info.map.latLngToContainerPoint([line[1].latitude, line[1].longitude])
      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(endPoint.x, endPoint.y)
      ctx.stroke()
    })
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.stroke()
  }

  private getPerpendicularLines(ship: IAisShip): IPositionAtTime[][] {
    const tenMinutes = 600
    const lines: IPositionAtTime[][] = []
    const aisCurrentPos = AisShip.getPositionAtTime(ship)
    const shipSpeed = ship.sog * KNOTS_TO_MS
    const pointBCog = ship.cog > 90 ? ship.cog - 90 : 360 + ship.cog - 90
    for (let i = 1; i <= 6; i++) {
      const time = i * tenMinutes
      const pointC = calculateNextPosition(aisCurrentPos, ship.cog, shipSpeed, time)
      const pointA = calculateNextPosition(pointC, (ship.cog + 90) % 360, this.props.perpLinesSize, 1)
      const pointB = calculateNextPosition(pointC, pointBCog, this.props.perpLinesSize, 1)
      lines.push([pointA, pointB])
    }
    return lines
  }
}
