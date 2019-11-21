import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class GeoLayerService {
  public async fetchGeoServerAddr() {
    return request({
      url: `${apiURL}/geoserver`,
    })
  }
  public async fetchGeoLayers() {
    return request({
      url: `${apiURL}/geolayers`,
    })
  }
}
