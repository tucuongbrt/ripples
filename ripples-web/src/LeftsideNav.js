import React, { Component } from 'react'
import { Nav, NavItem, NavLink, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';

export default class LeftsideNav extends Component {

  constructor(props) {
    super(props)
    this.state = {
      dropdownOpen: false,
      execPlanDisabled: true
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.toggleExecPlan = this.toggleExecPlan.bind(this)
    this.toogleDrawNewPlan = this.toggleDrawNewPlan.bind(this)
  }
  toggleDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  toggleExecPlan() {
    this.setState({
      execPlanDisabled: !this.state.execPlanDisabled
    })
    this.props.handleExecPlan()
  }
  toggleDrawNewPlan(){
    this.setState({
      execPlanDisabled: !this.state.execPlanDisabled
    })
    this.props.handleDrawNewPlan();
  }

  getPlans() {
    return this.props.plans.map(p => {
      return <DropdownItem key={"dropdown-item-" + p} onClick={() => this.props.handleUpdatePlan(p)}>{p}</DropdownItem>
    })
  }

  render() {
    return (
      <div>
        <h3>Menu</h3>
        <hr></hr>
        <Nav vertical>
          <NavItem>
            <NavLink disabled={!this.state.execPlanDisabled} onClick={this.toogleDrawNewPlan} href="#" >Draw new plan</NavLink>
          </NavItem>
          <NavItem>
            <NavLink disabled={this.state.execPlanDisabled} onClick={this.toggleExecPlan} href="#">Execute plan</NavLink>
          </NavItem>
          <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
            <DropdownToggle nav caret>
              Edit a Plan
            </DropdownToggle>
            <DropdownMenu>
              {this.getPlans()}
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </div>
    );
  }
}

