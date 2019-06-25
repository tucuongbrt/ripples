import { IUser } from '../model/IAuthState'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export function getCurrentUser(): Promise<IUser> {
  if (!localStorage.getItem('ACCESS_TOKEN')) {
    return Promise.reject('No access token set.')
  }

  return request({ url: `${apiURL}/user/me` })
}
