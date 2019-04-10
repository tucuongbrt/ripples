const OPERATOR = "operator"
const SCIENTIST = "scientist"

export default interface IAuthState {
    authenticated: boolean;
    currentUser: IUser;
}

export function isScientist(auth: IAuthState) {
    console.log("Checking for scientist", auth)
    return auth.authenticated && (
        auth.currentUser.role.toLowerCase() == SCIENTIST ||
        auth.currentUser.role.toLowerCase() == OPERATOR
        ) 
}

export function isOperator(auth: IAuthState) {
    return auth.authenticated && auth.currentUser.role == OPERATOR
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


export const noAuth: IAuthState = {
    authenticated: false,
    currentUser: noUser
}