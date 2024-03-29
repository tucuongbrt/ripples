import IObstacle from '../model/IObstacles'
import IPollution from '../model/IPollution'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class PollutionService {
  public async fetchPollutionData(): Promise<IPollution[]> {
    const response = await fetch(`${apiURL}/pollution`)
    const pollutions = await response.json()
    return pollutions
  }

  public async updatePollution(pollutionLocation: IPollution, id: number) {
    return request({
      method: 'POST',
      body: JSON.stringify(pollutionLocation),
      url: `${apiURL}/pollution/${id}`,
    })
  }

  public async updatePollutionStatus(id: number, status: string) {
    return request({
      method: 'POST',
      url: `${apiURL}/pollution/${id}/${status}`,
    })
  }

  public async syncPollutionMarkers(server: string, timestamp: Date, lat: any, lng: any, pollutionMarkers: number[]) {
    return request({
      method: 'POST',
      body: JSON.stringify({ server, timestamp, lat, lng, pollutionMarkers }),
      url: `${apiURL}/pollution/sync/`,
    })
  }

  public async deletePollution(id: number) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/pollution/${id}`,
    })
  }

  public async fetchPollutionExternalServer() {
    return request({
      url: `${apiURL}/pollution/server`,
    })
  }

  public async updatePollutionExternalServer(ipAddress: string) {
    return request({
      method: 'POST',
      body: JSON.stringify(ipAddress),
      url: `${apiURL}/pollution/server/`,
    })
  }

  public isPollutionBetweenDate(pollution: IPollution, startDate: any, endDate: any): boolean {
    const pollutionDate = new Date(pollution.timestamp)
    if (pollutionDate >= startDate && pollutionDate <= endDate) {
      return true
    } else {
      return false
    }
  }

  public async fetchObstaclesData(): Promise<IObstacle[]> {
    const response = await fetch(`${apiURL}/pollution/obstacles`)
    const pollutions = await response.json()
    return pollutions
  }

  public async addObstacle(obstaclePosition: IObstacle) {
    return request({
      method: 'POST',
      body: JSON.stringify(obstaclePosition),
      url: `${apiURL}/pollution/obstacle`,
    })
  }

  public async deleteObstacle(id: number) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/pollution/obstacle/${id}`,
    })
  }

  public async fetchAssetTrajectory(assetName: string, timestamp: Date) {
    const seconds = Math.floor(timestamp.getTime() / 1000)
    return request({
      url: `${apiURL}/positions/${assetName}/` + seconds,
    })
  }
}
