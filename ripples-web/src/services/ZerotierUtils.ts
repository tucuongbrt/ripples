import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class ZerotierService {
  public async joinNetwork(nodeId: string) {
    return request({
      url: `${apiURL}/zt/member/${nodeId}`,
    })
  }
}
