import IAisShip from '../model/IAisShip'
import PositionService from './PositionUtils'

const oneHourInMs = 3600000
const deltaHours = 12

export default class AISService {
  private positionService: PositionService = new PositionService()

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
    s.awareness = this.positionService.estimatePositionsAtDeltaTime(s, deltaHours)
    s.location = this.positionService.calculateShipLocation(s)
    return s
  }

  public getShipTypeAsString(type: number): string {
    const firstDigit = Math.floor(type / 10)
    const secondDigit = type % 10
    switch (firstDigit) {
      case 0:
        return 'Not Available'
      case 1:
        return 'Reserved'
      case 2:
        return `WIG`
      case 3:
        switch (secondDigit) {
          case 0:
            return 'Fishing'
          case 1:
          case 2:
            return 'Towing'
          case 3:
            return 'Dredging'
          case 4:
            return 'Diving ops'
          case 5:
            return 'Military Ops'
          case 6:
            return 'Sailing'
          case 7:
            return 'Pleasure Craft'
          default:
            return 'Reserved'
        }
      case 4:
        return 'High Speed Craft'
      case 5:
        switch (secondDigit) {
          case 0:
            return 'Pilot'
          case 1:
            return 'Search and Rescue'
          case 2:
            return 'Tug'
          case 3:
            return 'Port Tender'
          case 4:
            return 'Anti-pollution Equipment'
          case 5:
            return 'Law Enforcement'
          case 6:
          case 7:
            return 'Spare - Local Vessel'
          case 8:
            return 'Medical Transport'
          case 9:
            return 'Noncombatant'
        }
        break
      case 6:
        return 'Passenger'
      case 7:
        return 'Cargo'
      case 8:
        return 'Tanker'
      case 9:
        return 'Other type'
    }
    return `undefined`
  }

  private isRecent(ship: IAisShip): boolean {
    return ship.timestamp > Date.now() - oneHourInMs
  }
}
