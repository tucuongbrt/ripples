import React, { Component } from "react";
import Nav from "reactstrap/lib/Nav";
import { Link } from "react-router-dom";


/**
 * Should be reused by the other implementations of the navbar 
 */
export default class TopNavLinks extends Component {

    render() {
        return (
            <Nav className="mr-auto" navbar>
                <Link className="navbar-link" to="/">Ripples</Link>
                <Link className="navbar-link" to="/soirisk">Soi Risk Analysis</Link>
                <Link className="navbar-link" to="/messages/text">Text Messages</Link>
            </Nav>
        )
    }
}