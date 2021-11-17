import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export async function fetchDomainNames() {
  return request({
    method: 'GET',
    url: `${apiURL}/domain/names`,
  })
}

export async function createDomain(name: string) {
  return request({
    method: 'POST',
    url: `${apiURL}/domain/${name}`,
  })
}

export async function updateDomain(prevName: string, newName: string) {
  return request({
    method: 'POST',
    url: `${apiURL}/domain/${prevName}/${newName}`,
  })
}

export async function deleteDomain(name: string) {
  return request({
    method: 'DELETE',
    url: `${apiURL}/domain/${name}`,
  })
}
