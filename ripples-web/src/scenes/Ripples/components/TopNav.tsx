import React, { Component } from 'react'
import { Navbar, NavbarBrand, Collapse, NavbarToggler, Nav, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavItem, Button } from 'reactstrap';
import Login from '../../../components/Login';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAuthState, { isOperator, isScientist } from '../../../model/IAuthState';
import { idFromDate } from '../../../services/DateUtils';
import IPlan from '../../../model/IPlan';
import { ToolSelected } from '../../../model/ToolSelected';
import { setToolSelected } from '../../../redux/ripples.actions';

type propsType = {
  plans: IPlan[]
  auth: IAuthState
  toolSelected: ToolSelected
  selectedPlan: IPlan
  handleEditPlan: (_: IPlan) => void
  handleSendPlanToVehicle: () => void
  handleCancelEditPlan: () => void
  handleStartNewPlan: (_: string) => void
  handleSavePlan: () => void
  setToolSelected: (_: ToolSelected) => void
}

type stateType = {
  isNavOpen: boolean
  isDropdownOpen: boolean
  isExecPlanDisabled: boolean
  isEditingPlan: boolean
  dropdownText: string
}

class TopNav extends Component<propsType, stateType> {

  private dropdownDefaultText = 'Plan Editor';

  constructor(props: propsType) {
    super(props)


    this.state = {
      isNavOpen: true,
      isDropdownOpen: false,
      isExecPlanDisabled: true,
      isEditingPlan: false,
      dropdownText: this.dropdownDefaultText,
    }

    this.onNavToggle = this.onNavToggle.bind(this)
    this.onToolbarClick = this.onToolbarClick.bind(this)
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.handleSendToVehicle = this.handleSendToVehicle.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleCancelEditing = this.handleCancelEditing.bind(this)
    this.handleStartNewPlan = this.handleStartNewPlan.bind(this)
    this.handleSavePlan = this.handleSavePlan.bind(this)
    this.resetDropdown = this.resetDropdown.bind(this)
  }

  onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }

  toggleDropdown() {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  }

  resetDropdown() {
    this.setState({
      isEditingPlan: false,
      dropdownText: this.dropdownDefaultText
    })
  }

  handleSendToVehicle() {
    this.resetDropdown()
    this.props.handleSendPlanToVehicle();
  }

  handleCancelEditing() {
    this.resetDropdown()
    this.props.handleCancelEditPlan();
  }

  handleSavePlan() {
    this.resetDropdown()
    this.props.handleSavePlan()
  }

  handleEditPlan(plan: IPlan) {
    this.setState({
      isEditingPlan: true,
      dropdownText: `Editing ${plan.assignedTo} - ${plan.id}`
    })
    this.props.handleEditPlan(plan)
    this.props.setToolSelected(ToolSelected.ADD)
  }

  handleStartNewPlan() {
    const planId = `${this.props.auth.currentUser.name}-${idFromDate(new Date())}`
    this.setState({
      isEditingPlan: true,
      dropdownText: `Editing ${planId}`
    })
    this.props.handleStartNewPlan(planId)
  }


  getPlans() {
    const editingPlan = this.state.isEditingPlan;
    if (editingPlan) {
      const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
      return (
        <div>
          {isPlanAssigned ? <></> : 
          <DropdownItem key="save" onClick={this.handleSavePlan}>Save plan</DropdownItem>}
          <DropdownItem key="send" onClick={this.handleSendToVehicle}>Send plan to vehicle</DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>Cancel</DropdownItem>
        </div>
      )
    }
    return this.props.plans.map(p => {
      return <DropdownItem
        key={"dropdown-item-" + p.id}
        onClick={() => this.handleEditPlan(p)}>
        {p.assignedTo}-{p.id}
      </DropdownItem>
    })

  }

  onToolbarClick(tool: ToolSelected) {
    this.props.setToolSelected(tool)
  }

  buildPlanEditToolbar() {
    if (isScientist(this.props.auth)) {
      return (
        <>
          {this.state.isEditingPlan ?
            <NavItem className="mr-2">
              <Button color="primary" className="mr-1" onClick={() => this.onToolbarClick(ToolSelected.ADD)} active={this.props.toolSelected === ToolSelected.ADD}>Add</Button>
              <Button color="warning" className="mr-1" onClick={() => this.onToolbarClick(ToolSelected.MOVE)} active={this.props.toolSelected === ToolSelected.MOVE}>Move</Button>
              <Button color="danger" className="mr-1" onClick={() => this.onToolbarClick(ToolSelected.DELETE)} active={this.props.toolSelected === ToolSelected.DELETE}>Delete</Button>
            </NavItem> : <></>}
          <Dropdown className="mr-4" nav isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown}>
            <DropdownToggle nav caret>
              {this.state.dropdownText}
            </DropdownToggle>
            <DropdownMenu right>
              {this.state.isEditingPlan ? <></> :
                <DropdownItem key="new" onClick={() => this.handleStartNewPlan()}>New Plan</DropdownItem>}
              {isOperator(this.props.auth) ? this.getPlans() : <></>}
            </DropdownMenu>
          </Dropdown>
        </>)
    }
    return <></>
  }

  render() {
    return (
      <Navbar color="faded" light expand="md">
        <NavbarBrand className="mr-auto">Ripples</NavbarBrand>
        <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
        <Collapse isOpen={this.state.isNavOpen} navbar>
          <Nav className="ml-auto" navbar>
            {this.buildPlanEditToolbar()}
            <Login></Login>
          </Nav>
        </Collapse>
      </Navbar>)
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    vehicles: state.assets.vehicles,
    plans: state.planSet,
    auth: state.auth,
    toolSelected: state.toolSelected,
    selectedPlan: state.selectedPlan,
  }
}

const actionCreators = {
  setToolSelected,
}

export default connect(mapStateToProps, actionCreators)(TopNav)

