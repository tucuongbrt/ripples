import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export async function fetchApiKeys(email: string) {
  return request({
    method: 'GET',
    url: `${apiURL}/apikey/${email}`,
  })
}

export async function createApiKey(email: string, domain: string[], permission: string[]) {
  return request({
    method: 'POST',
    body: JSON.stringify({ email, domain, permission }),
    url: `${apiURL}/apikey`,
  })
}

export async function removeApiKey(token: string) {
  return request({
    method: 'POST',
    body: JSON.stringify(token),
    url: `${apiURL}/apikey/remove`,
  })
}
