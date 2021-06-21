import { IUser, IUserLocation } from '../model/IAuthState'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export function getCurrentUser(): Promise<IUser> {
  if (!localStorage.getItem('ACCESS_TOKEN')) {
    return Promise.reject('No access token set.')
  }

  return request({ url: `${apiURL}/user/me` })
}

export async function updateUserLocation(location: IUserLocation) {
  return request({
    method: 'POST',
    body: JSON.stringify(location),
    url: `${apiURL}/users/location`,
  })
}

export async function getUserLastLocation() {
  return request({
    url: `${apiURL}/users/location/`,
  })
}

export async function fetchUsers() {
  return request({ url: `${apiURL}/user/getUsers` })
}

export async function updateUserRole(email: string, role: string) {
  return request({
    body: JSON.stringify({ email, role }),
    method: 'POST',
    url: `${apiURL}/user/changeUserRole`,
  })
}

export async function updateUserDomain(email: string, domain: string[]) {
  return request({
    body: JSON.stringify(domain),
    method: 'POST',
    url: `${apiURL}/user/changeUserDomain/${email}`,
  })
}
