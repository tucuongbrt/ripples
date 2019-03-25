import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

export default class OAuth2RedirectHandler extends Component<any, {}> {
    getUrlParameter(name: string) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');

        var results = regex.exec(this.props.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    render() {        
        const token = this.getUrlParameter('token');
        const error = this.getUrlParameter('error');

        if(token) {
            localStorage.setItem("ACCESS_TOKEN", token);
            return <Redirect to={{
                pathname: "/ripples",
                state: { from: this.props.location }
            }}/>; 
        } else {
            return <Redirect to={{
                pathname: "/no-login-permission",
                state: { 
                    from: this.props.location,
                    error: error 
                }
            }}/>; 
        }
    }
}