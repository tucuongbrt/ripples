import React, { Component } from 'react'
import { Navbar, NavbarBrand, Collapse, NavbarToggler, Nav, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavItem, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import Login from '../../../components/Login';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAuthState, { isOperator, isScientist } from '../../../model/IAuthState';
import { idFromDate } from '../../../services/DateUtils';
import IPlan from '../../../model/IPlan';
import { ToolSelected } from '../../../model/ToolSelected';
import { setToolSelected, selectVehicle, setPlanDescription } from '../../../redux/ripples.actions';
import IAsset from '../../../model/IAsset';

type propsType = {
  vehicles: IAsset[],
  plans: IPlan[]
  auth: IAuthState
  toolSelected: ToolSelected
  selectedPlan: IPlan
  vehicleSelected: string
  handleEditPlan: (_: IPlan) => void
  handleSendPlanToVehicle: () => void
  handleCancelEditPlan: () => void
  handleStartNewPlan: (_: string) => void
  handleSavePlan: () => void
  setToolSelected: (_: ToolSelected) => void
  selectVehicle: (_: string) => void
  setPlanDescription: (_: string) => void
}

type stateType = {
  isNavOpen: boolean
  isPlansDropdownOpen: boolean
  isExecPlanDisabled: boolean
  isEditingPlan: boolean
  isModalOpen: boolean
  plansDropdownText: string
  isVehiclesDropdownOpen: boolean
  vehiclesDropdownText: string
}

class TopNav extends Component<propsType, stateType> {

  private plansDropdownDefaultText = 'Plan Editor';
  private vehiclesDropdownDefaultText = 'Select Vehicle'

  constructor(props: propsType) {
    super(props)


    this.state = {
      isNavOpen: true,
      isPlansDropdownOpen: false,
      isExecPlanDisabled: true,
      isEditingPlan: false,
      isModalOpen: false,
      plansDropdownText: this.plansDropdownDefaultText,
      vehiclesDropdownText: this.vehiclesDropdownDefaultText,
      isVehiclesDropdownOpen: false,
    }

    this.onNavToggle = this.onNavToggle.bind(this)
    this.onToolbarClick = this.onToolbarClick.bind(this)
    this.togglePlansDropdown = this.togglePlansDropdown.bind(this)
    this.toggleVehiclesDropdown = this.toggleVehiclesDropdown.bind(this)
    this.handleSendToVehicle = this.handleSendToVehicle.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleCancelEditing = this.handleCancelEditing.bind(this)
    this.handleStartNewPlan = this.handleStartNewPlan.bind(this)
    this.handleSavePlan = this.handleSavePlan.bind(this)
    this.resetPlansDropdown = this.resetPlansDropdown.bind(this)
    this.buildVehicleSelector = this.buildVehicleSelector.bind(this)
    this.onVehicleSelected = this.onVehicleSelected.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.buildEditDescriptionModal = this.buildEditDescriptionModal.bind(this)
    this.updatePlanDescription = this.updatePlanDescription.bind(this)
  }

  onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }

  toggleModal() {
    this.setState({isModalOpen: !this.state.isModalOpen})
  }

  togglePlansDropdown() {
    this.setState({
      isPlansDropdownOpen: !this.state.isPlansDropdownOpen
    });
  }

  toggleVehiclesDropdown() {
    this.setState({
      isVehiclesDropdownOpen: !this.state.isVehiclesDropdownOpen
    });
  }

  resetPlansDropdown() {
    this.setState({
      isEditingPlan: false,
      plansDropdownText: this.plansDropdownDefaultText
    })
  }

  handleSendToVehicle() {
    this.resetPlansDropdown()
    this.props.handleSendPlanToVehicle();
  }

  handleCancelEditing() {
    this.resetPlansDropdown()
    this.props.handleCancelEditPlan();
  }

  handleSavePlan() {
    this.resetPlansDropdown()
    this.props.handleSavePlan()
  }

  handleEditPlan(plan: IPlan) {
    this.setState({
      isEditingPlan: true,
      plansDropdownText: `Editing ${plan.assignedTo} - ${plan.id}`
    })
    this.props.handleEditPlan(plan)
    this.props.setToolSelected(ToolSelected.ADD)
  }

  handleStartNewPlan() {
    const planId = `${this.props.auth.currentUser.name}-${idFromDate(new Date())}`
    this.setState({
      isEditingPlan: true,
      plansDropdownText: `Editing ${planId}`
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
          <DropdownItem key="send" disabled={this.props.vehicleSelected.length == 0} onClick={this.handleSendToVehicle}>Send plan to {this.props.vehicleSelected}</DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>Cancel</DropdownItem>
          <DropdownItem key="description" onClick={this.toggleModal}>View/Edit description</DropdownItem>
          {this.buildEditDescriptionModal()}
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

  onVehicleSelected(name: string) {
    // update dropdown text
    this.setState({ vehiclesDropdownText: name })
    // set vehicle selected on redux state
    this.props.selectVehicle(name)
  }

  buildVehicleSelector() {
    const vehicleItems = this.props.vehicles.map(v =>
      <DropdownItem key={v.name} onClick={() => this.onVehicleSelected(v.name)}>{v.name}</DropdownItem>)
    return (
      <Dropdown className="mr-4" nav isOpen={this.state.isVehiclesDropdownOpen} toggle={this.toggleVehiclesDropdown}>
        <DropdownToggle nav caret>
          {this.state.vehiclesDropdownText}
        </DropdownToggle>
        <DropdownMenu right>
          {vehicleItems}
        </DropdownMenu>
      </Dropdown>
    )
  }

  buildEditDescriptionModal() {
    return (
      <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>View/Edit description</ModalHeader>
          <ModalBody>
          <Input type="textarea" placeholder="Set plan description" value={this.props.selectedPlan.description} onChange={evt => this.updatePlanDescription(evt)} />
          </ModalBody>
        </Modal>
    )
  }

  updatePlanDescription(evt: any) {
    console.log(evt.target.value)
    this.props.setPlanDescription(evt.target.value);
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
          <Dropdown className="mr-4" nav isOpen={this.state.isPlansDropdownOpen} toggle={this.togglePlansDropdown}>
            <DropdownToggle nav caret>
              {this.state.plansDropdownText}
            </DropdownToggle>
            <DropdownMenu right>
              {this.state.isEditingPlan ? <></> :
                <DropdownItem key="new" onClick={() => this.handleStartNewPlan()}>New Plan</DropdownItem>}
              {isOperator(this.props.auth) ? this.getPlans() : <></>}
            </DropdownMenu>
          </Dropdown>
          {this.buildVehicleSelector()}
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
    vehicleSelected: state.vehicleSelected,
  }
}

const actionCreators = {
  setToolSelected,
  selectVehicle,
  setPlanDescription,
}

export default connect(mapStateToProps, actionCreators)(TopNav)

