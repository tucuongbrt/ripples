const OPERATOR = 'operator'
const SCIENTIST = 'scientist'
const ADMINISTRATOR = 'administrator'
const CASUAL = 'casual'

export default interface IAuthState {
  authenticated: boolean
  currentUser: IUser
}

export function isScientist(auth: IAuthState) {
  return (
    auth.authenticated &&
    (auth.currentUser.role.toLowerCase() === SCIENTIST || auth.currentUser.role.toLowerCase() === OPERATOR)
  )
}

export function isOperator(auth: IAuthState) {
  return auth.authenticated && auth.currentUser.role.toLowerCase() === OPERATOR
}

export function isAdministrator(auth: IAuthState) {
  return auth.authenticated && auth.currentUser.role.toLowerCase() === ADMINISTRATOR
}

export function isCasual(auth: IAuthState) {
  return auth.authenticated && auth.currentUser.role.toLowerCase() === CASUAL
}

export function userHasDomain(auth: IAuthState, domainName: string) {
  return auth.authenticated && auth.currentUser.domain.includes(domainName)
}

export function getUserDomain(auth: IAuthState) {
  if (auth.authenticated) {
    return auth.currentUser.domain
  }
}

export interface IUser {
  id: number
  name: string
  email: string
  role: string
  domain: string[]
}

export const noUser: IUser = {
  email: '',
  id: -1,
  name: '',
  role: '',
  domain: [],
}

export const noAuth: IAuthState = {
  authenticated: false,
  currentUser: noUser,
}

export interface IUserLocation {
  name: string
  email: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export function isUserEqual(u1: IUserLocation, u2: IUserLocation) {
  return u1.email === u2.email
}
