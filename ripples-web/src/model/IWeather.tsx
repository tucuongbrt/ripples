import { ParamsType } from '../services/SoiUtils'

export default interface IWeather {
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

export function formatWeatherSource(source: string) {
  switch(source) {
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