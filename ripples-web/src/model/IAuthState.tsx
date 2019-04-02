export default interface IUserState {
    authenticated: boolean
    currentUser: User
}

interface User {
    id: number,
    name: string,
    email: string
    role: string
}

export const noUser: User = {
    id: -1,
    name: '',
    email: '',
    role: ''
}


export const noAuth: IUserState = {
    authenticated: false,
    currentUser: noUser
}