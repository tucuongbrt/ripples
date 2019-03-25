export default interface IUserState {
    authenticated: boolean
    currentUser: {name: string, email: string}
}