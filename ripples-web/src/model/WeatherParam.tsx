export enum WeatherParam {
  AIR_TEMPERATURE = 'airTemperature',
  CURRENT_SPEED = 'currentSpeed',
  WATER_TEMPERATURE = 'waterTemperature',
  WIND_SPEED = 'windSpeed',
}

export function formatWeatherParam(param: WeatherParam) {
  switch (param) {
    case WeatherParam.AIR_TEMPERATURE:
      return 'Air Temperature'
    case WeatherParam.CURRENT_SPEED:
      return 'Current Speed'
    case WeatherParam.WATER_TEMPERATURE:
      return 'Water Temperature'
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
    case WeatherParam.CURRENT_SPEED:
    case WeatherParam.WIND_SPEED:
      return `${value} m/s`
    default:
      return
  }
}