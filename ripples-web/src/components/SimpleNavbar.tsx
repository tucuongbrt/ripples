import React, { useState } from 'react'
import { Collapse, Nav, Navbar, NavbarToggler } from 'reactstrap'
import Login from './Login'
import TopNavLinks from './TopNavLinks'

export default function SimpleNavbar() {
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
        </Nav>
      </Collapse>
    </Navbar>
  )
}
