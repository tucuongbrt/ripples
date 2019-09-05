import ILatLng from '../model/ILatLng'
import { WeatherParam } from '../model/WeatherParam'
import DateService from './DateUtils'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class MapUtils {
  public static buildRequestTime(deltaHours: number, updateIntervalInHours: number) {
    const date = DateService.timeOffsetToRealTime(deltaHours)
    let hour = date.getHours()
    if (hour % updateIntervalInHours !== 0) {
      hour -= hour % updateIntervalInHours
    }
    date.setHours(hour)
    return DateService.formatDateForRequest(date)
  }

  public static buildLegendURL(layer: any) {
    let url = layer._url + '?'
    for (const key in layer.wmsParams) {
      if (key === 'request') {
        url += 'request=GetLegendGraphic&'
      } else if (key === 'layers') {
        url += 'layer=' + encodeURIComponent(layer.wmsParams[key]) + '&'
      } else if (key !== 'leaflet') {
        url += key + '=' + encodeURIComponent(layer.wmsParams[key]) + '&'
      }
    }
    return url
  }

  public static resetMapTime(updateIntervalInHours: number) {
    return MapUtils.buildRequestTime(0, updateIntervalInHours)
  }

  public static fetchWeatherData(location: ILatLng, params: WeatherParam) {
    return request({
      url: `${apiURL}/weather?lat=${location.latitude}&lng=${location.longitude}&params=${params}`,
    })
  }
}
