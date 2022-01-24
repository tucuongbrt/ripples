import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  Navbar,
  NavbarToggler,
} from 'reactstrap'
import Login from '../../../components/Login'
import TopNavLinks from '../../../components/TopNavLinks'
import IAsset from '../../../model/IAsset'
import IAuthState, { isAdministrator, isCasual, isOperator, isScientist } from '../../../model/IAuthState'
import ILatLng from '../../../model/ILatLng'
import IPlan, { getPlanKey, EmptyPlan } from '../../../model/IPlan'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import { WeatherParam } from '../../../model/WeatherParam'
import {
  clearMeasure,
  selectVehicle,
  selectVehicleLastState,
  selectPlanPosition,
  setEditVehicle,
  setEditingPlan,
  setPlanDescription,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setToolClickLocation,
  setToolSelected,
  togglePlanVisibility,
  unschedulePlan,
  updatePlanId,
  setUpdatingPlanId,
} from '../../../redux/ripples.actions'
import { Link } from 'react-router-dom'
import SoiService from '../../../services/SoiUtils'
import IAssetState from '../../../model/IAssetState'

const { NotificationManager } = require('react-notifications')

interface PropsType {
  vehicles: IAsset[]
  plans: IPlan[]
  auth: IAuthState
  toolSelected: ToolSelected
  isGpsActive: boolean
  selectedPlan: IPlan
  vehicleSelected: string
  weatherParam: WeatherParam | null
  isEditingPlan: boolean
  handleEditPlan: (_: IPlan) => void
  handleSendPlanToVehicle: () => void
  handleCancelEditPlan: () => void
  handleSavePlan: () => void
  handleDeletePlan: () => void
  handleUpdatePlanId: (prevId: string, newId: string) => void
  setToolSelected: (_: ToolSelected) => void
  selectVehicle: (_: string) => void
  selectVehicleLastState: (_: IAssetState) => void
  selectPlanPosition: (_: ILatLng) => void
  setPlanDescription: (_: string) => void
  togglePlanVisibility: (_: IPlan) => void
  updatePlanId: (_: string) => void
  unschedulePlan: () => void
  clearMeasure: () => void
  setEditingPlan: (_: boolean) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
  setEditVehicle: (v: IAsset | undefined) => void
  setToolClickLocation: (l: ILatLng | null) => void
  setUpdatingPlanId: (_: boolean) => void
}

interface StateType {
  isNavOpen: boolean
  isPlansDropdownOpen: boolean
  isExecPlanDisabled: boolean
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
  private soiService: SoiService = new SoiService()

  constructor(props: PropsType) {
    super(props)
    this.state = {
      isDescriptionModalOpen: false,
      isEditPlanIdModalOpen: false,
      isExecPlanDisabled: true,
      isNavOpen: false,
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
    this.handleSavePlan = this.handleSavePlan.bind(this)
    this.onVehicleSelected = this.onVehicleSelected.bind(this)
    this.toggleDescriptionModal = this.toggleDescriptionModal.bind(this)
    this.toggleEditPlanIdModal = this.toggleEditPlanIdModal.bind(this)
    this.buildEditDescriptionModal = this.buildEditDescriptionModal.bind(this)
    this.updatePlanDescription = this.updatePlanDescription.bind(this)
    this.onDeletePlan = this.onDeletePlan.bind(this)
  }

  async componentDidUpdate(prevProps: PropsType) {
    const { selectedPlan, setEditingPlan } = this.props
    if (prevProps.selectedPlan !== selectedPlan && selectedPlan !== EmptyPlan) {
      this.setState({
        plansDropdownText: `Editing ${selectedPlan.assignedTo} - ${selectedPlan.id}`,
      })
      setEditingPlan(true)

      try {
        const delay = (ms: any) => new Promise((res) => setTimeout(res, ms))
        await delay(100)
        const resp: ILatLng = await this.soiService.planPosition(selectedPlan.id)
        if (resp.latitude !== undefined && resp.longitude !== undefined) {
          // set plan selected position on redux state
          this.props.selectPlanPosition(resp)
        } else {
          NotificationManager.warning('Failed to fetch asset laststate')
        }
      } catch (error) {
        NotificationManager.warning('Failed to fetch asset laststate')
      }
    }
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
    const isOpen = !this.state.isEditPlanIdModalOpen
    if (!isOpen) {
      // Update plan id when modal closes
      this.setState({ plansDropdownText: `Editing - ${this.props.selectedPlan.id}` })
      if (this.props.selectedPlan.waypoints.length > 0) {
        // only try to update the plan id if the plan has any waypoints
        // if the plan has no waypoints it was created just now,
        // and so it does not exist in the server yet
        this.props.handleUpdatePlanId(this.state.previousPlanId, this.props.selectedPlan.id)
      }
    }
    this.props.setUpdatingPlanId(isOpen)
    this.setState({ isEditPlanIdModalOpen: isOpen })
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
      plansDropdownText: this.plansDropdownDefaultText,
    })
    this.props.setEditingPlan(false)
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
      plansDropdownText: `Editing ${plan.assignedTo} - ${plan.id}`,
    })
    this.props.handleEditPlan(plan)
    this.props.setToolSelected(ToolSelected.NONE)
    this.props.setEditingPlan(true)
  }

  public onDeletePlan() {
    this.resetPlansDropdown()
    this.props.handleDeletePlan()
  }

  public buildPlanList() {
    const { isEditingPlan } = this.props
    if (isEditingPlan) {
      const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
      return (
        <div>
          {!isPlanAssigned && (
            <>
              <DropdownItem key="editId" onClick={this.toggleEditPlanIdModal}>
                Edit plan id
              </DropdownItem>
              <DropdownItem key="editDescription" onClick={this.toggleDescriptionModal}>
                View/Edit description
              </DropdownItem>
              <DropdownItem key="save" onClick={this.handleSavePlan}>
                Save plan
              </DropdownItem>
              <DropdownItem key="delete" onClick={this.onDeletePlan}>
                Delete plan
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
    return this.props.plans.map((p) => {
      if (p.id !== 'idle') {
        return (
          <div className="plan-dropdown-item" key={getPlanKey(p)}>
            <i
              onClick={() => this.props.togglePlanVisibility(p)}
              className={(p.visible ? 'far fa-eye' : 'far fa-eye-slash') + ' mr-1'}
            />
            <DropdownItem disabled={!p.visible}>
              <span onClick={() => this.handleEditPlan(p)} className="mouse-pointer">
                {p.assignedTo}-{p.id}
              </span>
            </DropdownItem>
          </div>
        )
      } else {
        return null
      }
    })
  }

  public async onVehicleSelected(name: string) {
    // update dropdown text
    this.setState({ vehiclesDropdownText: name })
    // set vehicle selected on redux state
    this.props.selectVehicle(name)

    try {
      const resp: IAssetState = await this.soiService.vehicleLastState(name)
      if (resp.latitude !== undefined && resp.longitude !== undefined) {
        // set vehicle selected last state on redux state
        this.props.selectVehicleLastState(resp)
      } else {
        NotificationManager.warning('Failed to fetch asset laststate')
      }
    } catch (error) {
      NotificationManager.warning('Failed to fetch asset laststate')
    }
  }

  public buildVehicleSelector() {
    const vehicleItems = this.props.vehicles.map((v) => (
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
            onChange={(evt) => this.updatePlanDescription(evt)}
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
            onChange={(evt) => this.updatePlanId(evt)}
          />
        </ModalBody>
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
    if (isScientist(this.props.auth) || isAdministrator(this.props.auth) || isOperator(this.props.auth)) {
      return (
        <>
          <Dropdown
            className="mr-4"
            nav={true}
            isOpen={this.state.isPlansDropdownOpen}
            toggle={this.togglePlansDropdown}
          >
            <DropdownToggle nav={true} caret={true}>
              {this.state.plansDropdownText}
            </DropdownToggle>
            <DropdownMenu right={true}>{this.buildPlanList()}</DropdownMenu>
          </Dropdown>
          {this.buildVehicleSelector()}
        </>
      )
    }
    return <></>
  }

  public buildSettingsBtn() {
    if (this.props.auth.authenticated && !isCasual(this.props.auth)) {
      return (
        <Link className="navbar-link" to="/settings/panel">
          <i title="Settings Panel" className="fas fa-cogs fa-sm" />
        </Link>
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
          <Nav navbar={true}>
            <div id="planEditToolbar">{this.buildPlanEditToolbar()}</div>
            <Login />
            <div id="settings-btn">{this.buildSettingsBtn()}</div>
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
    isGpsActive: state.isGpsActive,
    weatherParam: state.weatherParam,
    isEditingPlan: state.isEditingPlan,
  }
}

const actionCreators = {
  selectVehicle,
  selectVehicleLastState,
  selectPlanPosition,
  setPlanDescription,
  setToolSelected,
  togglePlanVisibility,
  updatePlanId,
  unschedulePlan,
  setSidePanelVisibility,
  clearMeasure,
  setSidePanelTitle,
  setSidePanelContent,
  setEditingPlan,
  setEditVehicle,
  setToolClickLocation,
  setUpdatingPlanId,
}

export default connect(mapStateToProps, actionCreators)(TopNav)
