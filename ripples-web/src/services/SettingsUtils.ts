import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class SettingsService {
  public async fetchSettings() {
    return request({
      method: 'GET',
      url: `${apiURL}/settings`,
    })
  }

  public async createSettingDomain(name: string) {
    return request({
      method: 'POST',
      url: `${apiURL}/settings/${name}`,
    })
  }

  public async updateSettings(id: string, paramKey: string, paramValue: string) {
    return request({
      method: 'POST',
      body: JSON.stringify(paramValue),
      url: `${apiURL}/settings/update/${id}/${paramKey}`,
    })
  }

  public async removeParam(id: string, paramKey: string) {
    return request({
      method: 'POST',
      url: `${apiURL}/settings/remove/${id}/${paramKey}`,
    })
  }

  public async removeSettingDomain(id: string) {
    return request({
      method: 'POST',
      url: `${apiURL}/settings/removeDomain/${id}`,
    })
  }
}

/*
export async function createSetting(name: string, settings: Map<string, string>) {
  return request({
    method: 'POST',
    body: JSON.stringify({ domainName: name, settings: settings }),
    url: `${apiURL}/settings`,
  })
}
*/
