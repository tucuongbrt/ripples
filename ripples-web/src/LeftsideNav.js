import React, { Component } from 'react'
import { Nav, NavItem, NavLink, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';

export default class LeftsideNav extends Component {

  constructor(props) {
    super(props)
    this.state = {
      dropdownOpen: false,
      execPlanDisabled: true,
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.toggleExecPlan = this.handleExecPlan.bind(this)
    this.toogleDrawNewPlan = this.handleDrawNewPlan.bind(this)
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
  handleDrawNewPlan(){
    this.setState({
      execPlanDisabled: !this.state.execPlanDisabled
    })
    this.props.handleDrawNewPlan();
  }


  getPlans() {
    return this.props.plans.map(p => {
      return <DropdownItem key={"dropdown-item-" + p} onClick={() => this.props.handleEditPlan(p)}>{p}</DropdownItem>
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
            <NavLink disabled={this.state.execPlanDisabled} onClick={this.handleExecPlan} href="#">Execute plan</NavLink>
          </NavItem>
          <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
            <DropdownToggle nav caret>
              {this.props.dropdownText}
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

