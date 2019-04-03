export default interface IUserState {
    authenticated: boolean
    currentUser: IUser
}

export interface IUser {
    id: number,
    name: string,
    email: string
    role: string
}

export const noUser: IUser = {
    id: -1,
    name: '',
    email: '',
    role: ''
}


export const noAuth: IUserState = {
    authenticated: false,
    currentUser: noUser
}