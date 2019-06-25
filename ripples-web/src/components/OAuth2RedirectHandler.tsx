import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

export default class OAuth2RedirectHandler extends Component<any, {}> {
  public getUrlParameter(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')

    const results = regex.exec(this.props.location.search)
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
  }

  public render() {
    const token = this.getUrlParameter('token')
    const error = this.getUrlParameter('error')

    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token)
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { from: this.props.location },
          }}
        />
      )
    } else {
      return (
        <Redirect
          to={{
            pathname: '/no-login-permission',
            state: {
              error,
              from: this.props.location,
            },
          }}
        />
      )
    }
  }
}
