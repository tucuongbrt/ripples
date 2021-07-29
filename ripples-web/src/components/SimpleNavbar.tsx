import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Collapse, Nav, Navbar, NavbarToggler } from 'reactstrap'
import { isCasual } from '../model/IAuthState'
import Login from './Login'
import TopNavLinks from './TopNavLinks'

export default function SimpleNavbar(props: any) {
  // Declare a new state variable, which we'll call "isNavOpen"
  // Here we are using React Hooks
  const [isNavOpen, setIsNavOpen] = useState(true)
  return (
    <Navbar color="faded" light={true} expand="md">
      <NavbarToggler className="mr-2" onClick={() => setIsNavOpen(!isNavOpen)} />
      <Collapse isOpen={isNavOpen} navbar={true}>
        <TopNavLinks />
        <Nav className="ml-auto" navbar={true}>
          <Login />
          {props.auth.auth.authenticated && !isCasual(props.auth.auth) ? (
            <div id="settings-btn">
              <Link className="navbar-link" to="/settings/manager">
                <i title="Settings Manager" className="fas fa-cogs fa-sm" />
              </Link>
            </div>
          ) : (
            <></>
          )}
        </Nav>
      </Collapse>
    </Navbar>
  )
}
