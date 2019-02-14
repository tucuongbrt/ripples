import React, { Component } from 'react'
import { Navbar, NavbarBrand, Collapse, NavbarToggler, Nav, NavItem, NavLink, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';


export default class TopNav extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isNavOpen: true,
      dropdownOpen: false,
      execPlanDisabled: true,
      editingPlan: false,
    }

    this.onNavToggle = this.onNavToggle.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.handleExecPlan = this.handleExecPlan.bind(this)
    this.toogleDrawNewPlan = this.handleDrawNewPlan.bind(this)
    this.handleSendToVehicle = this.handleSendToVehicle.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleCancelEditing = this.handleCancelEditing.bind(this);
  }

  onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }

  toggleDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  handleExecPlan() {
    this.setState({
      execPlanDisabled: !this.state.execPlanDisabled
    })
    this.props.handleExecPlan()
  }
  handleDrawNewPlan() {
    this.setState({
      execPlanDisabled: !this.state.execPlanDisabled
    })
    this.props.handleDrawNewPlan();
  }

  handleEditPlan(p) {
    this.setState({
      editingPlan: true,
    })
    this.props.handleEditPlan(p);
  }

  handleSendToVehicle() {
    this.setState({
      editingPlan: false
    })
    this.props.sendPlanToVehicle();
  }

  handleCancelEditing() {
    this.setState({
      editingPlan: false
    })
    this.props.cancelEditing();
  }

  getPlans() {
    const editingPlan = this.state.editingPlan;
    if (editingPlan) {
      return (
        <div>
          <DropdownItem key="send" onClick={this.handleSendToVehicle}>Send plan to vehicle</DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>Cancel</DropdownItem>
        </div>
      )
    }
    else {
      return this.props.plans.map(([v,p]) => {
        return <DropdownItem key={"dropdown-item-" + p} onClick={() => this.handleEditPlan(p)}>{v+"_"+p}</DropdownItem>
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
            <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
              <DropdownToggle nav caret>
                {this.props.dropdownText}
              </DropdownToggle>
              <DropdownMenu>
                {this.getPlans()}
              </DropdownMenu>
            </Dropdown>
            <NavItem>
              <NavLink disabled={!this.state.execPlanDisabled} onClick={this.toogleDrawNewPlan} href="#" >Draw new plan</NavLink>
            </NavItem>
            <NavItem>
              <NavLink disabled={this.state.execPlanDisabled} onClick={this.handleExecPlan} href="#">Execute plan</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>)
  }
}

