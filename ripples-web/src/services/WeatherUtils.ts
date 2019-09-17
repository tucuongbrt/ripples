import { WeatherParam } from '../model/WeatherParam'
import { XYPoint } from '../scenes/Ripples/components/LinePlot'
import { ParamsType } from '../services/SoiUtils'

export default class WeatherService {
  public formatWeatherSource(source: string) {
    switch (source) {
      case 'icon':
        return 'ICON GWAM'
      case 'noaa':
        return 'NOAA GFS / NOAA Wavewatch 3'
      case 'meteo':
        return 'Météo-France'
      case 'dwd':
        return 'Deutscher Wetterdienst'
      case 'meto':
        return 'UK MetOffice'
      case 'sg':
        return 'Storm Glass'
      default:
        return source.toUpperCase()
    }
  }

  public joinSourceValues(weather: IWeather[], param: WeatherParam) {
    const weatherByHour = weather.map((w: IWeather) => {
      return w[param]
    })
    let result: { [x: string]: number[] } = {}
    weatherByHour.forEach(row => {
      if (!row) {
        return
      }
      for (let [key, value] of Object.entries(row)) {
        result[key] = result[key] || []
        result[key].push(+value)
      }
    })
    return result
  }

  public preparePlotData(ws: WeatherSource) {
    return Object.entries(ws).map(([key, val]) => {
      const points: XYPoint[] = val.map((v, idx) => ({ x: -48 + idx, y: +v }))
      return { id: this.formatWeatherSource(key), data: points }
    })
  }
}

export interface IWeather {
  airTemperature?: ParamsType
  currentDirection?: ParamsType
  currentSpeed?: ParamsType
  gust?: ParamsType
  waterTemperature?: ParamsType
  waveDirection?: ParamsType
  waveHeight?: ParamsType
  windDirection?: ParamsType
  windSpeed?: ParamsType
  timestamp: ParamsType
}

export interface WeatherSource {
  [name: string]: number[]
}

export interface WeatherData {
  id: string
  data: XYPoint[]
}