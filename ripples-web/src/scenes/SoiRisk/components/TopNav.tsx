import React, { Component } from 'react'
import 'react-notifications/lib/notifications.css'
import { connect } from 'react-redux'
import Button from 'reactstrap/lib/Button'
import Col from 'reactstrap/lib/Col'
import Collapse from 'reactstrap/lib/Collapse'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Input from 'reactstrap/lib/Input'
import Label from 'reactstrap/lib/Label'
import Nav from 'reactstrap/lib/Nav'
import Navbar from 'reactstrap/lib/Navbar'
import NavbarToggler from 'reactstrap/lib/NavbarToggler'
import NavItem from 'reactstrap/lib/NavItem'
import Login from '../../../components/Login'
import TopNavLinks from '../../../components/TopNavLinks'
import IAuthState, { isOperator } from '../../../model/IAuthState'
import IRipplesState from '../../../model/IRipplesState'
import SoiService from '../../../services/SoiUtils'
const { NotificationManager } = require('react-notifications')

interface PropsType {
  auth: IAuthState
}
interface StateType {
  isNavOpen: boolean
  phoneNumber: string
}

class TopNav extends Component<PropsType, StateType> {
  private soiService: SoiService = new SoiService()
  constructor(props: PropsType) {
    super(props)
    this.state = {
      isNavOpen: true,
      phoneNumber: '+351',
    }
    this.onPhoneSubmit = this.onPhoneSubmit.bind(this)
    this.onPhoneChanged = this.onPhoneChanged.bind(this)
    this.onNavToggle = this.onNavToggle.bind(this)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public async onPhoneSubmit() {
    try {
      await this.soiService.subscribeToSms(this.state.phoneNumber)
      NotificationManager.success(`${this.state.phoneNumber} subscribed`)
      this.setState({ phoneNumber: '+351' })
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
        <NavItem id="phoneSubscriberItem" className="mr-2">
          <Form inline={true}>
            <FormGroup row={true}>
              <Col>
                <Label for="phoneNumberInput">Subscribe to SMS notifications</Label>
                <Input
                  className="mr-2"
                  placeholder="phone number"
                  onChange={this.onPhoneChanged}
                  value={this.state.phoneNumber}
                  id="phoneNumberInput"
                />
              </Col>
            </FormGroup>
            <Button onClick={this.onPhoneSubmit}>Subscribe</Button>
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
