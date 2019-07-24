import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
} from 'reactstrap'
import Login from '../../../components/Login'
import TopNavLinks from '../../../components/TopNavLinks'
import IAsset from '../../../model/IAsset'
import IAuthState, { isOperator, isScientist } from '../../../model/IAuthState'
import IPlan, { getPlanKey } from '../../../model/IPlan'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import {
  selectVehicle,
  setPlanDescription,
  setToolSelected,
  togglePlanVisibility,
  unschedulePlan,
  updatePlanId,
} from '../../../redux/ripples.actions'
import { idFromDate } from '../../../services/DateUtils'

interface PropsType {
  vehicles: IAsset[]
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
  togglePlanVisibility: (_: IPlan) => void
  updatePlanId: (_: string) => void
  unschedulePlan: () => void
}

interface StateType {
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

class TopNav extends Component<PropsType, StateType> {
  private plansDropdownDefaultText = 'Plan Editor'
  private vehiclesDropdownDefaultText = 'Select Vehicle'

  constructor(props: PropsType) {
    super(props)

    this.state = {
      isDescriptionModalOpen: false,
      isEditPlanIdModalOpen: false,
      isEditingPlan: false,
      isExecPlanDisabled: true,
      isNavOpen: true,
      isPlansDropdownOpen: false,
      isVehiclesDropdownOpen: false,
      plansDropdownText: this.plansDropdownDefaultText,
      previousPlanId: '',
      vehiclesDropdownText: this.vehiclesDropdownDefaultText,
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
    this.onVehicleSelected = this.onVehicleSelected.bind(this)
    this.toggleDescriptionModal = this.toggleDescriptionModal.bind(this)
    this.toggleEditPlanIdModal = this.toggleEditPlanIdModal.bind(this)
    this.buildEditDescriptionModal = this.buildEditDescriptionModal.bind(this)
    this.updatePlanDescription = this.updatePlanDescription.bind(this)
    this.onDeletePlan = this.onDeletePlan.bind(this)
  }

  public onNavToggle() {
    this.setState({ isNavOpen: !this.state.isNavOpen })
  }

  public toggleDescriptionModal() {
    this.setState({ isDescriptionModalOpen: !this.state.isDescriptionModalOpen })
  }

  public toggleEditPlanIdModal() {
    if (!this.state.isEditPlanIdModalOpen) {
      this.setState({ previousPlanId: this.props.selectedPlan.id })
    }
    this.setState({ isEditPlanIdModalOpen: !this.state.isEditPlanIdModalOpen })
  }

  public togglePlansDropdown() {
    this.setState({
      isPlansDropdownOpen: !this.state.isPlansDropdownOpen,
    })
  }

  public toggleVehiclesDropdown() {
    this.setState({
      isVehiclesDropdownOpen: !this.state.isVehiclesDropdownOpen,
    })
  }

  public resetPlansDropdown() {
    this.setState({
      isEditingPlan: false,
      plansDropdownText: this.plansDropdownDefaultText,
    })
  }

  public handleSendToVehicle() {
    this.resetPlansDropdown()
    this.props.handleSendPlanToVehicle()
  }

  public handleCancelEditing() {
    this.resetPlansDropdown()
    this.props.handleCancelEditPlan()
  }

  public handleSavePlan() {
    this.resetPlansDropdown()
    this.props.handleSavePlan()
  }

  public handleEditPlan(plan: IPlan) {
    this.setState({
      isEditingPlan: true,
      plansDropdownText: `Editing ${plan.assignedTo} - ${plan.id}`,
    })
    this.props.handleEditPlan(plan)
    this.props.setToolSelected(ToolSelected.ADD)
  }

  public handleStartNewPlan() {
    const planId = `${this.props.auth.currentUser.name}-${idFromDate(new Date())}`
    this.setState({
      isEditingPlan: true,
      plansDropdownText: `Editing ${planId}`,
    })
    this.props.handleStartNewPlan(planId)
  }

  public handleUpdatePlanId() {
    this.setState({ plansDropdownText: `Editing - ${this.props.selectedPlan.id}` })
    if (this.props.selectedPlan.waypoints.length > 0) {
      // only try to update the plan id if the plan has any waypoints
      // if the plan has no waypoints it was created just now,
      // and so it does not exist in the server yet
      this.props.handleUpdatePlanId(this.state.previousPlanId, this.props.selectedPlan.id)
    }
  }

  public onDeletePlan() {
    this.resetPlansDropdown()
    this.props.handleDeletePlan()
  }

  public buildPlanList() {
    const editingPlan = this.state.isEditingPlan
    if (editingPlan) {
      const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
      return (
        <div>
          {isPlanAssigned ? (
            <></>
          ) : (
            <>
              <DropdownItem key="save" onClick={this.handleSavePlan}>
                Save plan
              </DropdownItem>
              <DropdownItem key="delete" onClick={this.onDeletePlan}>
                Delete plan
              </DropdownItem>
              <DropdownItem key="editDescription" onClick={this.toggleDescriptionModal}>
                View/Edit description
              </DropdownItem>
              <DropdownItem key="editId" onClick={this.toggleEditPlanIdModal}>
                Edit plan id
              </DropdownItem>
            </>
          )}
          <DropdownItem
            key="send"
            disabled={this.props.vehicleSelected.length === 0}
            onClick={this.handleSendToVehicle}
          >
            Send plan to {this.props.vehicleSelected}
          </DropdownItem>
          <DropdownItem key="unschedule" onClick={() => this.props.unschedulePlan()}>
            Unschedule all waypoints
          </DropdownItem>
          <DropdownItem key="cancel" onClick={this.handleCancelEditing}>
            Cancel
          </DropdownItem>
          {this.buildEditDescriptionModal()}
          {this.buildEditPlanIdModal()}
        </div>
      )
    }
    return this.props.plans.map(p => {
      return (
        <div className="dropdown-item" key={getPlanKey(p)}>
          <i
            onClick={() => this.props.togglePlanVisibility(p)}
            className={(p.visible ? 'far fa-eye' : 'far fa-eye-slash') + ' mr-1'}
          />
          <span onClick={() => this.handleEditPlan(p)} className="mouse-pointer">
            {p.assignedTo}-{p.id}
          </span>
        </div>
      )
    })
  }

  public onVehicleSelected(name: string) {
    // update dropdown text
    this.setState({ vehiclesDropdownText: name })
    // set vehicle selected on redux state
    this.props.selectVehicle(name)
  }

  public buildVehicleSelector() {
    const vehicleItems = this.props.vehicles.map(v => (
      <DropdownItem key={v.name} onClick={() => this.onVehicleSelected(v.name)}>
        {v.name}
      </DropdownItem>
    ))
    return (
      <Dropdown
        className="mr-4"
        nav={true}
        isOpen={this.state.isVehiclesDropdownOpen}
        toggle={this.toggleVehiclesDropdown}
      >
        <DropdownToggle nav={true} caret={true}>
          {this.state.vehiclesDropdownText}
        </DropdownToggle>
        <DropdownMenu right={true}>{vehicleItems}</DropdownMenu>
      </Dropdown>
    )
  }

  public buildEditDescriptionModal() {
    return (
      <Modal isOpen={this.state.isDescriptionModalOpen} toggle={this.toggleDescriptionModal}>
        <ModalHeader toggle={this.toggleDescriptionModal}>View/Edit description</ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            placeholder="Set plan description"
            value={this.props.selectedPlan.description}
            onChange={evt => this.updatePlanDescription(evt)}
          />
        </ModalBody>
      </Modal>
    )
  }

  public buildEditPlanIdModal() {
    return (
      <Modal isOpen={this.state.isEditPlanIdModalOpen} toggle={this.toggleEditPlanIdModal}>
        <ModalHeader toggle={this.toggleEditPlanIdModal}>Update plan id</ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            placeholder="Set plan id"
            value={this.props.selectedPlan.id}
            onChange={evt => this.updatePlanId(evt)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleUpdatePlanId}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  public updatePlanDescription(evt: any) {
    this.props.setPlanDescription(evt.target.value)
  }

  public updatePlanId(evt: any) {
    this.props.updatePlanId(evt.target.value)
  }

  public onToolbarClick(tool: ToolSelected) {
    this.props.setToolSelected(tool)
  }

  public buildPlanEditToolbar() {
    if (isScientist(this.props.auth)) {
      return (
        <>
          {this.state.isEditingPlan ? (
            <NavItem className="mr-2">
              <Button
                color="primary"
                className="mr-1"
                onClick={() => this.onToolbarClick(ToolSelected.ADD)}
                active={this.props.toolSelected === ToolSelected.ADD}
              >
                Add
              </Button>
              <Button
                color="warning"
                className="mr-1"
                onClick={() => this.onToolbarClick(ToolSelected.MOVE)}
                active={this.props.toolSelected === ToolSelected.MOVE}
              >
                Move
              </Button>
              <Button
                color="danger"
                className="mr-1"
                onClick={() => this.onToolbarClick(ToolSelected.DELETE)}
                active={this.props.toolSelected === ToolSelected.DELETE}
              >
                Delete
              </Button>
              <Button
                color="primary"
                className="mr-1"
                onClick={() => this.onToolbarClick(ToolSelected.SCHEDULE)}
                active={this.props.toolSelected === ToolSelected.SCHEDULE}
              >
                Schedule
              </Button>
              <Button
                color="warning"
                className="mr-1"
                onClick={() => this.onToolbarClick(ToolSelected.UNSCHEDULE)}
                active={this.props.toolSelected === ToolSelected.UNSCHEDULE}
              >
                Unschedule
              </Button>
            </NavItem>
          ) : (
            <></>
          )}
          <Dropdown
            className="mr-4"
            nav={true}
            isOpen={this.state.isPlansDropdownOpen}
            toggle={this.togglePlansDropdown}
          >
            <DropdownToggle nav={true} caret={true}>
              {this.state.plansDropdownText}
            </DropdownToggle>
            <DropdownMenu right={true}>
              {this.state.isEditingPlan ? (
                <></>
              ) : (
                <DropdownItem key="new" onClick={() => this.handleStartNewPlan()}>
                  New Plan
                </DropdownItem>
              )}
              {isOperator(this.props.auth) ? this.buildPlanList() : <></>}
            </DropdownMenu>
          </Dropdown>
          {this.buildVehicleSelector()}
        </>
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
            {this.buildPlanEditToolbar()}
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
    plans: state.planSet,
    selectedPlan: state.selectedPlan,
    toolSelected: state.toolSelected,
    vehicleSelected: state.vehicleSelected,
    vehicles: state.assets.vehicles,
  }
}

const actionCreators = {
  selectVehicle,
  setPlanDescription,
  setToolSelected,
  togglePlanVisibility,
  updatePlanId,
  unschedulePlan,
}

export default connect(
  mapStateToProps,
  actionCreators
)(TopNav)
