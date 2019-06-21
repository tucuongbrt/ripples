import React, { Component } from 'react'
import { Navbar, NavbarBrand, Collapse, NavbarToggler, Nav, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavItem, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import Login from '../../../components/Login';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAuthState, { isOperator, isScientist } from '../../../model/IAuthState';
import { idFromDate } from '../../../services/DateUtils';
import IPlan from '../../../model/IPlan';
import { ToolSelected } from '../../../model/ToolSelected';
import { setToolSelected, selectVehicle, setPlanDescription, updatePlanId } from '../../../redux/ripples.actions';
import IAsset from '../../../model/IAsset';
import { Link } from 'react-router-dom';
import TopNavLinks from '../../../components/TopNavLinks';

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
  handleDeletePlan: () => void
  handleUpdatePlanId: (prevId: string, newId: string) => void
  setToolSelected: (_: ToolSelected) => void
  selectVehicle: (_: string) => void
  setPlanDescription: (_: string) => void
  updatePlanId: (_: string) => void
}

type stateType = {
  isNavOpen: boolean
  isPlansDropdownOpen: boolean
  isExecPlanDisabled: boolean
  isEditingPlan: boolean
  isDescriptionModalOpen: boolean
  isEditPlanIdModalOpen: boolean
  plansDropdownText: string
  isVehiclesDropdownOpen: boolean
  vehiclesDropdownText: string
  previousPlanId: string
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
      isDescriptionModalOpen: false,
      isEditPlanIdModalOpen: false,
      plansDropdownText: this.plansDropdownDefaultText,
      vehiclesDropdownText: this.vehiclesDropdownDefaultText,
      isVehiclesDropdownOpen: false,
      previousPlanId: '',
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
    this.handleUpdatePlanId = this.handleUpdatePlanId.bind(this)
    this.resetPlansDropdown = this.resetPlansDropdown.bind(this)
    this.buildVehicleSelector = this.buildVehicleSelector.bind(this)
    this.onVehicleSelected = this.onVehicleSelected.bind(this)
    this.toggleDescriptionModal = this.toggleDescriptionModal.bind(this)
    this.toggleEditPlanIdModal = this.toggleEditPlanIdModal.bind(this)
    this.buildEditDescriptionModal = this.buildEditDescriptionModal.bind(this)
    this.updatePlanDescription = this.updatePlanDescription.bind(this)
    this.onDeletePlan = this.onDeletePlan.bind(this)
  }

  onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  }

  toggleDescriptionModal() {
    this.setState({ isDescriptionModalOpen: !this.state.isDescriptionModalOpen })
  }

  toggleEditPlanIdModal() {
    if (!this.state.isEditPlanIdModalOpen) {
      this.setState({ previousPlanId: this.props.selectedPlan.id })
    }
    this.setState({ isEditPlanIdModalOpen: !this.state.isEditPlanIdModalOpen })
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

  handleUpdatePlanId() {
    this.setState({ plansDropdownText: `Editing - ${this.props.selectedPlan.id}` })
    if (this.props.selectedPlan.waypoints.length > 0) {
      // only try to update the plan id if the plan has any waypoints
      // if the plan has no waypoints it was created just now, 
      // and so it does not exist in the server yet
      this.props.handleUpdatePlanId(this.state.previousPlanId, this.props.selectedPlan.id)
    }
  }

  onDeletePlan() {
    this.resetPlansDropdown()
    this.props.handleDeletePlan()
  }

  buildPlanList() {
    const editingPlan = this.state.isEditingPlan;
    if (editingPlan) {
      const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
      return (
        <div>
          {isPlanAssigned ? <></> :
            <>
              <DropdownItem key="save" onClick={this.handleSavePlan}>Save plan</DropdownItem>
              <DropdownItem key="delete" onClick={this.onDeletePlan}>Delete plan</DropdownItem>
              <DropdownItem key="editDescription" onClick={this.toggleDescriptionModal}>View/Edit description</DropdownItem>
              <DropdownItem key="editId" onClick={this.toggleEditPlanIdModal}>Edit plan id</DropdownItem>
            </>
          }
          <DropdownItem key="send" disabled={this.props.vehicleSelected.length == 0} onClick={this.handleSendToVehicle}>Send plan to {this.props.vehicleSelected}</DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>Cancel</DropdownItem>

          {this.buildEditDescriptionModal()}
          {this.buildEditPlanIdModal()}
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
      <Modal isOpen={this.state.isDescriptionModalOpen} toggle={this.toggleDescriptionModal}>
        <ModalHeader toggle={this.toggleDescriptionModal}>View/Edit description</ModalHeader>
        <ModalBody>
          <Input type="textarea" placeholder="Set plan description" value={this.props.selectedPlan.description} onChange={evt => this.updatePlanDescription(evt)} />
        </ModalBody>
      </Modal>
    )
  }

  buildEditPlanIdModal() {
    return (
      <Modal isOpen={this.state.isEditPlanIdModalOpen} toggle={this.toggleEditPlanIdModal}>
        <ModalHeader toggle={this.toggleEditPlanIdModal}>Update plan id</ModalHeader>
        <ModalBody>
          <Input type="textarea" placeholder="Set plan id" value={this.props.selectedPlan.id} onChange={evt => this.updatePlanId(evt)} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleUpdatePlanId}>Save</Button>
        </ModalFooter>
      </Modal>
    )
  }

  updatePlanDescription(evt: any) {
    this.props.setPlanDescription(evt.target.value)
  }

  updatePlanId(evt: any) {
    this.props.updatePlanId(evt.target.value)
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
              <Button color="primary" className="mr-1" onClick={() => this.onToolbarClick(ToolSelected.EDIT)} active={this.props.toolSelected === ToolSelected.EDIT}>Edit</Button>
            </NavItem> : <></>}
          <Dropdown className="mr-4" nav isOpen={this.state.isPlansDropdownOpen} toggle={this.togglePlansDropdown}>
            <DropdownToggle nav caret>
              {this.state.plansDropdownText}
            </DropdownToggle>
            <DropdownMenu right>
              {this.state.isEditingPlan ? <></> :
                <DropdownItem key="new" onClick={() => this.handleStartNewPlan()}>New Plan</DropdownItem>}
              {isOperator(this.props.auth) ? this.buildPlanList() : <></>}
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
        <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
        <Collapse isOpen={this.state.isNavOpen} navbar>
          <TopNavLinks></TopNavLinks>
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
  updatePlanId,
}

export default connect(mapStateToProps, actionCreators)(TopNav)

