import React, { Component } from "react";
import { Button, NavItem, NavLink } from "reactstrap";
import IAuthState from '../model/IAuthState'

const GOOGLE_AUTH_URL = process.env.REACT_APP_API_BASE_URL + 
                        '/oauth2/authorize/google?redirect_uri=' + 
                        process.env.REACT_APP_OAUTH2_REDIRECT_URI;

type propsType = {
    authState: IAuthState
    handleLogout: Function
}

export default class Login extends Component<propsType, {}> {

    handleLoginClick() {
        location.href = GOOGLE_AUTH_URL;
    }

    render() {
        if (this.props.authState.authenticated) {
            return (
            <Button color="info" size="sm" onClick={() => this.props.handleLogout()}>
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