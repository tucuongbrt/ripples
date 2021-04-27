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

  public isPollutionBetweenDate(pollution: IPollution, startDate: any, endDate: any): boolean {
    const pollutionDate = new Date(pollution.timestamp)
    if (pollutionDate >= startDate && pollutionDate <= endDate) {
      return true
    } else {
      return false
    }
  }
}
