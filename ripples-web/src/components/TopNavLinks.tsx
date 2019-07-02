import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Nav from 'reactstrap/lib/Nav'

/**
 * Should be reused by the other implementations of the navbar
 */
export default class TopNavLinks extends Component {
  public render() {
    return (
      <Nav className="mr-auto" navbar={true}>
        <Link className="navbar-link" to="/">
          Ripples
        </Link>
        <Link className="navbar-link" to="/soirisk">
          Soi Risk Analysis
        </Link>
        <Link className="navbar-link" to="/messages/text">
          Text Messages
        </Link>
      </Nav>
    )
  }
}
