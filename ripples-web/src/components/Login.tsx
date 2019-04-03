import React, { Component } from "react";
import { Button } from "reactstrap";
import IRipplesState from '../model/IRipplesState'
import IAuthState, { IUser } from '../model/IAuthState'
import { connect } from "react-redux";
const {NotificationManager} = require('react-notifications');
import { removeUser, setUser } from "../redux/ripples.actions";
import { getCurrentUser } from "../services/AuthUtils";

const GOOGLE_AUTH_URL = process.env.REACT_APP_API_BASE_URL +
    '/oauth2/authorize/google?redirect_uri=' +
    process.env.REACT_APP_OAUTH2_REDIRECT_URI;

type propsType = {
    auth: IAuthState,
    removeUser: Function,
    setUser: Function
}

class Login extends Component<propsType, {}> {

    constructor(props: propsType) {
        super(props)
        this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
    }

    componentDidMount() {
        if (localStorage.getItem("ACCESS_TOKEN")) {
            this.loadCurrentlyLoggedInUser()
        }
    }

    handleLoginClick() {
        location.href = GOOGLE_AUTH_URL;
    }

    async loadCurrentlyLoggedInUser() {
        try {
            const user: IUser = await getCurrentUser()
            this.props.setUser(user)
            NotificationManager.info(`${user.role.toLowerCase()}: ${user.email}`)
        } catch(error) {
            NotificationManager.error(`Invalid access token`)
        }

    }


    handleLogout() {
        localStorage.removeItem("ACCESS_TOKEN");
        this.props.removeUser();
    }

    render() {
        if (this.props.auth.authenticated) {
            return (
                <Button color="info" size="sm" onClick={() => this.handleLogout()}>
                    Logout
            </Button>
            )
        } else {
            return (
                <Button color="info" size="sm" onClick={this.handleLoginClick}>
                    Log in with Google
                </Button>
            );
        }
    }
}

function mapStateToProps(state: IRipplesState) {
    const auth = state.auth
    return { auth: auth }
}

const actionCreators = {
    removeUser,
    setUser
}

export default connect(mapStateToProps, actionCreators)(Login)