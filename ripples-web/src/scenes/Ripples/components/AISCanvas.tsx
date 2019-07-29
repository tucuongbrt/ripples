import IAisShip, { AisShip } from '../../../model/IAisShip'
import IPositionAtTime from '../../../model/IPositionAtTime'
import PositionService from '../../../services/PositionUtils'

interface PropsType {
  ship: IAisShip
  perpLinesSize: number
}

export default class AISCanvas {
  public props: PropsType
  private positionService: PositionService = new PositionService()
  constructor(props: PropsType) {
    this.props = props
    this.drawInCanvas = this.drawInCanvas.bind(this)
    this.getCirclesCenter = this.getCirclesCenter.bind(this)
  }

  public drawInCanvas(info: any) {
    const ship = this.props.ship
    const ctx = info.canvas.getContext('2d')
    if (ship.sog > 0.2) {
      this.drawAisLines(info, ctx, ship)
    }
  }

  private drawAisLines(info: any, ctx: any, ship: IAisShip) {
    const speed = ship.sog * this.positionService.getKnotsToMs()
    const posIn1H = this.positionService.calculateNextPosition(AisShip.getPositionAtTime(ship), ship.cog, speed, 3600)
    const pointA = info.map.latLngToContainerPoint([ship.latitude, ship.longitude])
    const pointB = info.map.latLngToContainerPoint([posIn1H.latitude, posIn1H.longitude])
    ctx.beginPath()
    ctx.strokeStyle = 'rgb(0,0,0,0.5)'
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.stroke()
    this.getCirclesCenter(ship).forEach((line: IPositionAtTime) => {
      const radius = 2
      const center = info.map.latLngToContainerPoint([line.latitude, line.longitude])
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'rgb(127,0,0)'
      ctx.fill()
    })
  }

  private getCirclesCenter(ship: IAisShip): IPositionAtTime[] {
    const tenMinutes = 600
    const centers: IPositionAtTime[] = []
    const aisCurrentPos = AisShip.getPositionAtTime(ship)
    const shipSpeed = ship.sog * this.positionService.getKnotsToMs()
    for (let i = 1; i <= 6; i++) {
      const time = i * tenMinutes
      const pointC = this.positionService.calculateNextPosition(aisCurrentPos, ship.cog, shipSpeed, time)
      centers.push(pointC)
    }
    return centers
  }
}
