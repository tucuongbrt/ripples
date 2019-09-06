export enum WeatherParam {
  AIR_TEMPERATURE = 'airTemperature',
  CURRENT_DIRECTION = 'currentDirection',
  CURRENT_SPEED = 'currentSpeed',
  GUST = 'gust',
  WATER_TEMPERATURE = 'waterTemperature',
  WAVE_DIRECTION = 'waveDirection',
  WAVE_HEIGHT = 'waveHeight',
  WIND_DIRECTION = 'windDirection',
  WIND_SPEED = 'windSpeed',
}

export function formatWeatherParam(param: WeatherParam) {
  switch (param) {
    case WeatherParam.AIR_TEMPERATURE:
      return 'Air Temperature'
    case WeatherParam.CURRENT_DIRECTION:
      return 'Current Direction'
    case WeatherParam.CURRENT_SPEED:
      return 'Current Speed'
    case WeatherParam.GUST:
      return 'Gust'
    case WeatherParam.WATER_TEMPERATURE:
      return 'Water Temperature'
    case WeatherParam.WAVE_DIRECTION:
      return 'Wave Direction'
    case WeatherParam.WAVE_HEIGHT:
      return 'Wave Height'
    case WeatherParam.WIND_DIRECTION:
      return 'Wind Direction'
    case WeatherParam.WIND_SPEED:
      return 'Wind Speed'
    default:
      return
  }
}

export function formatWeatherValue(value: string, param: WeatherParam) {
  switch (param) {
    case WeatherParam.AIR_TEMPERATURE:
    case WeatherParam.WATER_TEMPERATURE:
      return `${value} ºC`
    case WeatherParam.WAVE_HEIGHT:
      return `${value} m`
    case WeatherParam.CURRENT_SPEED:
    case WeatherParam.GUST:
    case WeatherParam.WIND_SPEED:
      return `${value} m/s`
    case WeatherParam.CURRENT_DIRECTION:
    case WeatherParam.WAVE_DIRECTION:
    case WeatherParam.WIND_DIRECTION:
      return `${value}º`
    default:
      return
  }
}
