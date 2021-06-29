import { request } from './RequestUtils'
const toGeojson = require('@mapbox/togeojson')

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class KMLService {
  public async fetchMapsNamesAndURLS() {
    return request({
      url: `${apiURL}/kml`,
    })
  }

  public async fetchMapsNames() {
    return request({
      url: `${apiURL}/kml/names`,
    })
  }

  public async fetchMapData(mapName: string) {
    const res = await fetch(`${apiURL}/kml/${mapName}`)
    const response = await res.json()
    const xml = response.message
    const dom = new DOMParser().parseFromString(xml, 'text/xml')
    return toGeojson.kml(dom, { styles: true })
  }

  public async addNewMap(mapName: string, mapURL: string) {
    return request({
      body: JSON.stringify({ name: mapName, url: mapURL }),
      method: 'POST',
      url: `${apiURL}/kml`,
    })
  }

  public async deleteMap(mapName: string) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/kml/${mapName}`,
    })
  }

  public async updateMapDomain(mapName: string, domain: string[]) {
    return request({
      method: 'POST',
      body: JSON.stringify(domain),
      url: `${apiURL}/kml/${mapName}`,
    })
  }

  public async fetchMapDomain(mapName: string) {
    return request({
      url: `${apiURL}/kml/domain/${mapName}`,
    })
  }
}
