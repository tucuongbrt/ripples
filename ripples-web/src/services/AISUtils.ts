import IAisShip from '../model/IAisShip'
import { calculateShipLocation, estimatePositionsAtDeltaTime } from './PositionUtils'

const oneHourInMs = 3600000
const deltaHours = 12

export default class AISService {
  public async fetchAisData(): Promise<IAisShip[]> {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ais`)
    let ships = await response.json()
    ships = ships.map((s: IAisShip) => this.convertAISToRipples(s))
    return ships.filter((s: IAisShip) => this.isRecent(s))
  }

  /**
   * Convert AIS payload that is fetched from the server into a usable format
   */
  public convertAISToRipples(s: IAisShip): IAisShip {
    s.timestamp = new Date(s.timestamp).getTime()
    s.awareness = estimatePositionsAtDeltaTime(s, deltaHours)
    s.location = calculateShipLocation(s)
    return s
  }
  private isRecent(ship: IAisShip): boolean {
    return ship.timestamp > Date.now() - oneHourInMs
  }
}
