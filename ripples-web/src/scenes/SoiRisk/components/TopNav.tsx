import React, { Component } from 'react'
import 'react-notifications/lib/notifications.css'
import { connect } from 'react-redux'
import Button from 'reactstrap/lib/Button'
import Collapse from 'reactstrap/lib/Collapse'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Input from 'reactstrap/lib/Input'
import Nav from 'reactstrap/lib/Nav'
import Navbar from 'reactstrap/lib/Navbar'
import NavbarToggler from 'reactstrap/lib/NavbarToggler'
import NavItem from 'reactstrap/lib/NavItem'
import Login from '../../../components/Login'
import TopNavLinks from '../../../components/TopNavLinks'
import IAuthState, { isOperator } from '../../../model/IAuthState'
import IRipplesState from '../../../model/IRipplesState'
import { subscribeToSms } from '../../../services/SoiUtils'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  auth: IAuthState
}
interface StateType {
  isNavOpen: boolean
  phoneNumber: string
}

class TopNav extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props)
    this.state = {
      isNavOpen: true,
      phoneNumber: '',
    }
    this.buildSmsSubscriber = this.buildSmsSubscriber.bind(this)
    this.onPhoneSubmit = this.onPhoneSubmit.bind(this)
    this.onPhoneChanged = this.onPhoneChanged.bind(this)
    this.onNavToggle = this.onNavToggle.bind(this)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public async onPhoneSubmit() {
    try {
      await subscribeToSms(this.state.phoneNumber)
      NotificationManager.success(`${this.state.phoneNumber} subscribed`)
      this.setState({ phoneNumber: '' })
    } catch (e) {
      NotificationManager.warning(`Could not subscribe ${this.state.phoneNumber}`)
    }
  }

  public onPhoneChanged(event: any) {
    this.setState({ phoneNumber: event.target.value })
  }

  public buildSmsSubscriber() {
    if (isOperator(this.props.auth)) {
      return (
        <NavItem className="mr-2">
          <Form inline={true}>
            <FormGroup>
              <Input
                className="mr-2"
                placeholder="phone number"
                onChange={this.onPhoneChanged}
                value={this.state.phoneNumber}
              />
            </FormGroup>
            <Button onClick={this.onPhoneSubmit}>Submit</Button>
          </Form>
        </NavItem>
      )
    }
    return <></>
  }

  public render() {
    return (
      <Navbar color="faded" light={true} expand="md">
        <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
        <Collapse isOpen={this.state.isNavOpen} navbar={true}>
          <TopNavLinks />
          <Nav className="ml-auto" navbar={true}>
            {this.buildSmsSubscriber()}
            <Login />
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
  }
}

export default connect(
  mapStateToProps,
  null
)(TopNav)
