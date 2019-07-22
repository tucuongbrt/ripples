import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import IAuthState from '../model/IAuthState'
import IRipplesState from '../model/IRipplesState'
import { removeUser } from '../redux/ripples.actions'

const GOOGLE_AUTH_URL =
  process.env.REACT_APP_API_BASE_URL +
  '/oauth2/authorize/google?redirect_uri=' +
  process.env.REACT_APP_OAUTH2_REDIRECT_URI

interface PropsType {
  auth: IAuthState
  removeUser: () => void
}

class Login extends Component<PropsType, {}> {
  constructor(props: PropsType) {
    super(props)
    this.handleLogout = this.handleLogout.bind(this)
  }

  public handleLoginClick() {
    window.location.href = GOOGLE_AUTH_URL
  }

  public handleLogout() {
    localStorage.removeItem('ACCESS_TOKEN')
    this.props.removeUser()
  }

  public render() {
    if (this.props.auth.authenticated) {
      return (
        <Button className="m-1" color="info" size="sm" onClick={() => this.handleLogout()}>
          Logout
        </Button>
      )
    } else {
      return (
        <Button className="m-1" color="info" size="sm" onClick={this.handleLoginClick}>
          Log in with Google
        </Button>
      )
    }
  }
}

function mapStateToProps(state: IRipplesState) {
  const auth = state.auth
  return { auth }
}

const actionCreators = {
  removeUser,
}

export default connect(
  mapStateToProps,
  actionCreators
)(Login)