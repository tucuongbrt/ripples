import DateService from './DateUtils'

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
}
