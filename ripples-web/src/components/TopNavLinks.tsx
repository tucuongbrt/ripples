import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Nav from 'reactstrap/lib/Nav'
import logo from '../assets/logo.png'

/**
 * Should be reused by the other implementations of the navbar
 */
export default class TopNavLinks extends Component {
  public render() {
    return (
      <Nav id="nav" navbar={true}>
        <Link className="navbar-link" to="/">
          <img id="logo" src={logo} alt="logo" />
        </Link>
        <Link className="navbar-link" to="/soirisk">
          <i title="Soi Risk Analysis" className="fas fa-exclamation-triangle fa-lg" />
        </Link>
        <Link className="navbar-link" to="/messages/text">
          <i title="Text Messages" className="fas fa-envelope-open-text fa-lg" />
        </Link>
        <Link className="navbar-link" to="/kml/manager">
          <i title="KML Manager" className="fas fa-map fa-lg" />
        </Link>
        <Link className="navbar-link" to="/logbook/manager">
          <i title="Logbook Manager" className="fas fa-book-open fa-lg" />
        </Link>
        <Link className="navbar-link" to="/user/manager">
          <i title="Users Manager" className="fas fa-users fa-lg" />
        </Link>
      </Nav>
    )
  }
}
