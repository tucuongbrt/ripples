export default class MapUtils {
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
}
