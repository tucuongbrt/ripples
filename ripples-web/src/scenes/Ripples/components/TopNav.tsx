import React, { Component } from 'react'
import { Navbar, NavbarBrand, Collapse, NavbarToggler, Nav, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import IPair from '../../../model/IPair';
import Login from '../../../components/Login';

type propsType = {
  vehiclePlanPairs: IPair<string>[]
  handleEditPlan: Function
  handleSendPlanToVehicle: Function
  handleCancelEditPlan: Function
}

type stateType = {
  isNavOpen: boolean
  isDropdownOpen: boolean
  isExecPlanDisabled: boolean
  isEditingPlan: boolean
  dropdownText: string
}

export default class TopNav extends Component<propsType, stateType> {

  constructor(props: propsType) {
    super(props)

    this.state = {
      isNavOpen: true,
      isDropdownOpen: false,
      isExecPlanDisabled: true,
      isEditingPlan: false,
      dropdownText: 'Edit Plan'
    }

    this.onNavToggle = this.onNavToggle.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.handleSendToVehicle = this.handleSendToVehicle.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleCancelEditing = this.handleCancelEditing.bind(this);
  }

  onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }

  toggleDropdown() {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  }

  handleEditPlan(p: IPair<string>) {
    this.setState({
      isEditingPlan: true,
      dropdownText: `Editing ${p.first}_${p.second}`
    })
    this.props.handleEditPlan(p.second);
  }

  handleSendToVehicle() {
    this.setState({
      isEditingPlan: false,
      dropdownText: `Edit Plan`
    })
    this.props.handleSendPlanToVehicle();
  }

  handleCancelEditing() {
    this.setState({
      isEditingPlan: false,
      dropdownText: `Edit Plan`
    })
    this.props.handleCancelEditPlan();
  }

  getPlans() {
    const editingPlan = this.state.isEditingPlan;
    if (editingPlan) {
      return (
        <div>
          <DropdownItem key="send" onClick={this.handleSendToVehicle}>Send plan to vehicle</DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>Cancel</DropdownItem>
        </div>
      )
    }
    else {
      return this.props.vehiclePlanPairs.map((p: IPair<string>) => {
        return <DropdownItem 
          key={"dropdown-item-" + p}
          onClick={() => this.handleEditPlan(p)}>
          {p.first + "_" + p.second}
          </DropdownItem>
      })
    }
  }

  render() {
    return (
      <Navbar color="faded" light expand="md">
        <NavbarBrand className="mr-auto">Ripples</NavbarBrand>
        <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
        <Collapse isOpen={this.state.isNavOpen} navbar>
          <Nav className="ml-auto" navbar>
            <Dropdown nav isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown}>
              <DropdownToggle nav caret>
                {this.state.dropdownText}
              </DropdownToggle>
              <DropdownMenu>
                {this.getPlans()}
              </DropdownMenu>
            </Dropdown>
            <Login></Login>
          </Nav>
        </Collapse>
      </Navbar>)
  }
}

