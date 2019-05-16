import React, { Component } from "react";
import Navbar from "reactstrap/lib/Navbar";
import NavbarBrand from "reactstrap/lib/NavbarBrand";
import NavbarToggler from "reactstrap/lib/NavbarToggler";
import Collapse from "reactstrap/lib/Collapse";
import Nav from "reactstrap/lib/Nav";
import Login from "../../../components/Login";
import NavItem from "reactstrap/lib/NavItem";
import Form from "reactstrap/lib/Form";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";
import Button from "reactstrap/lib/Button";

type propsType = {}
type stateType = {
    isNavOpen: boolean
}

export default class TopNav extends Component<propsType, stateType>{

    constructor(props: propsType) {
        super(props)
        this.state = {
            isNavOpen: true
        }
    }

    onNavToggle() {
        this.setState({ isNavOpen: !this.state.isNavOpen });
    }

    subscribeSms(event: any) {
        console.log(event);
    }

    buildSmsSubscriber() {
        return <NavItem>
            <Form inline>
                <FormGroup>
                    <Label for="phoneNumber" hidden>PhoneNumber</Label>
                    <Input type="text" name="phone" id="phoneNumber" placeholder="phone number" />
                </FormGroup>
                <Button onClick={this.subscribeSms}>Submit</Button>
            </Form>
        </NavItem>
    }

    render() {
        return (
            <Navbar color="faded" light expand="md">
                <NavbarBrand className="mr-auto" href="/">Ripples</NavbarBrand>
                <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
                <Collapse isOpen={this.state.isNavOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        {this.buildSmsSubscriber()}
                        <Login></Login>
                    </Nav>
                </Collapse>
            </Navbar>)
    }
}