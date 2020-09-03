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
  UncontrolledDropdown,
  InputGroup,
} from 'reactstrap'
import Login from '../../../components/Login'
import TopNavLinks from '../../../components/TopNavLinks'
import IAsset from '../../../model/IAsset'
import IAuthState, { isOperator, isScientist } from '../../../model/IAuthState'
import ILatLng from '../../../model/ILatLng'
import IPlan, { getPlanKey, EmptyPlan } from '../../../model/IPlan'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import { WeatherParam } from '../../../model/WeatherParam'
import {
  clearMeasure,
  selectVehicle,
  setEditVehicle,
  setEditingPlan,
  setPlanDescription,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setToolClickLocation,
  setToolSelected,
  setWeatherParam,
  toggleGps,
  togglePlanVisibility,
  unschedulePlan,
  updatePlanId,
  setUpdatingPlanId,
} from '../../../redux/ripples.actions'
import ZerotierService from '../../../services/ZerotierUtils'

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
  setPlanDescription: (_: string) => void
  togglePlanVisibility: (_: IPlan) => void
  updatePlanId: (_: string) => void
  unschedulePlan: () => void
  clearMeasure: () => void
  setEditingPlan: (_: boolean) => void
  setSidePanelVisibility: (_: boolean) => void
  setSidePanelTitle: (_: string) => void
  setSidePanelContent: (_: any) => void
  toggleGps: () => void
  setEditVehicle: (v: IAsset | undefined) => void
  setWeatherParam: (p: WeatherParam | null) => void
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
  nodeId: string
}

class TopNav extends Component<PropsType, StateType> {
  private plansDropdownDefaultText = 'Plan Editor'
  private vehiclesDropdownDefaultText = 'Select Vehicle'
  private ztService: ZerotierService = new ZerotierService()

  constructor(props: PropsType) {
    super(props)
    this.state = {
      isDescriptionModalOpen: false,
      isEditPlanIdModalOpen: false,
      isExecPlanDisabled: true,
      isNavOpen: true,
      isPlansDropdownOpen: false,
      isVehiclesDropdownOpen: false,
      plansDropdownText: this.plansDropdownDefaultText,
      previousPlanId: '',
      vehiclesDropdownText: this.vehiclesDropdownDefaultText,
      nodeId: '',
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
    this.onMeasureToggle = this.onMeasureToggle.bind(this)
    this.onAnnotationToggle = this.onAnnotationToggle.bind(this)
    this.onGpsClick = this.onGpsClick.bind(this)
    this.onToolpickToogle = this.onToolpickToogle.bind(this)
    this.onNodeIdSubmission = this.onNodeIdSubmission.bind(this)
  }

  componentDidUpdate(prevProps: PropsType) {
    const { selectedPlan, setEditingPlan } = this.props
    if (prevProps.selectedPlan !== selectedPlan && selectedPlan !== EmptyPlan) {
      this.setState({
        plansDropdownText: `Editing ${selectedPlan.assignedTo} - ${selectedPlan.id}`,
      })
      setEditingPlan(true)
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
    })
  }

  public onVehicleSelected(name: string) {
    // update dropdown text
    this.setState({ vehiclesDropdownText: name })
    // set vehicle selected on redux state
    this.props.selectVehicle(name)
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
    if (isScientist(this.props.auth)) {
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
            <DropdownMenu right={true}>{isOperator(this.props.auth) && this.buildPlanList()}</DropdownMenu>
          </Dropdown>
          {this.buildVehicleSelector()}
        </>
      )
    }
    return <></>
  }

  public buildGeneralToolbar() {
    return (
      <>
        <NavItem
          className="mt-auto mb-auto mr-4"
          active={this.props.toolSelected === ToolSelected.MEASURE}
          onClick={this.onMeasureToggle}
        >
          <i
            className={
              'fas fa-ruler-horizontal fa-lg ' + (this.props.toolSelected === ToolSelected.MEASURE ? 'selected' : '')
            }
            title="Measure Tool"
          />
        </NavItem>
        <NavItem
          className="mt-auto mb-auto mr-4"
          active={this.props.toolSelected === ToolSelected.ANNOTATION}
          onClick={this.onAnnotationToggle}
        >
          <i
            className={
              'far fa-sticky-note fa-lg ' + (this.props.toolSelected === ToolSelected.ANNOTATION ? 'selected' : '')
            }
            title="Annotation Tool"
          />
        </NavItem>
        {this.buildWeatherSelector()}
        <NavItem className="mt-auto mb-auto mr-4" active={this.props.isGpsActive} onClick={this.onGpsClick}>
          <i
            className={'fas fa-map-marker-alt fa-lg ' + (this.props.isGpsActive ? 'selected' : '')}
            title="Enable Gps Tracking"
          />
        </NavItem>
        {this.props.auth.authenticated && this.buildZerotierSelector()}
      </>
    )
  }

  public buildWeatherSelector() {
    return (
      <UncontrolledDropdown nav={true} className="mr-4 active">
        <DropdownToggle nav={true} caret={false}>
          <i
            className={'fas fa-map-pin fa-lg ' + (this.props.toolSelected === ToolSelected.TOOLPICK ? 'selected' : '')}
            title="Enable Weather Toolpick"
          />
        </DropdownToggle>
        <DropdownMenu right={true}>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.AIR_TEMPERATURE)}>
            Air Temperature
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.CURRENT_DIRECTION)}>
            Current Direction
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.CURRENT_SPEED)}>Current Speed</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.GUST)}>Wind gust</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WATER_TEMPERATURE)}>
            Water Temperature
          </DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WAVE_DIRECTION)}>Wave Direction</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WAVE_HEIGHT)}>Wave Height</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WIND_DIRECTION)}>Wind Direction</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(WeatherParam.WIND_SPEED)}>Wind Speed</DropdownItem>
          <DropdownItem onClick={() => this.onToolpickToogle(null)}>None</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  public buildZerotierSelector() {
    return (
      <UncontrolledDropdown id="tooltip-zt" nav={true} className="mr-4 active">
        <DropdownToggle nav={true} caret={false}>
          <i className={'fas fa-network-wired fa-lg'} title="Join Ripples Zerotier Network" />
        </DropdownToggle>
        <DropdownMenu right={true}>
          <InputGroup>
            <Input
              placeholder="Node address"
              onChange={(evt) => this.setState({ nodeId: evt.target.value })}
              value={this.state.nodeId}
              type="text"
              required={true}
            />
          </InputGroup>
          <Button onClick={this.onNodeIdSubmission}>Add node</Button>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  public async onNodeIdSubmission() {
    const { nodeId } = this.state
    if (nodeId === '' || nodeId.length !== 10) {
      NotificationManager.error('Please insert a valid 10-digit ZeroTier node ID!')
      return
    }
    const { status, message } = await this.ztService.joinNetwork(nodeId)
    status === 'Success' ? NotificationManager.success(message) : NotificationManager.error(message)
    this.setState({ nodeId: '' })
  }

  public render() {
    return (
      <Navbar color="faded" light={true} expand="md">
        <NavbarToggler className="mr-2" onClick={this.onNavToggle} />
        <Collapse isOpen={this.state.isNavOpen} navbar={true}>
          <TopNavLinks />
          <Nav navbar={true}>
            <div id="planEditToolbar">{this.buildPlanEditToolbar()}</div>
            <div id="generalToolbar">{this.buildGeneralToolbar()}</div>
            <Login />
          </Nav>
        </Collapse>
      </Navbar>
    )
  }

  private onMeasureToggle() {
    if (this.props.toolSelected === ToolSelected.MEASURE) {
      this.props.setToolSelected(ToolSelected.NONE)
      this.props.setSidePanelVisibility(false)
      this.props.clearMeasure()
    } else {
      this.props.setToolSelected(ToolSelected.MEASURE)
      this.props.setSidePanelVisibility(true)
      this.props.setSidePanelTitle('Measure distance')
      this.props.setSidePanelContent({})
      this.props.setEditVehicle(undefined)
    }
  }

  private onAnnotationToggle() {
    if (this.props.toolSelected === ToolSelected.ANNOTATION) {
      this.props.setToolSelected(ToolSelected.NONE)
    } else {
      this.props.setToolSelected(ToolSelected.ANNOTATION)
    }
    this.props.setSidePanelVisibility(false)
  }

  private onGpsClick() {
    this.props.toggleGps()
  }

  private onToolpickToogle(weatherParam: WeatherParam | null) {
    if (weatherParam !== null) {
      this.props.setToolSelected(ToolSelected.TOOLPICK)
    } else if (this.props.toolSelected === ToolSelected.TOOLPICK) {
      this.props.setToolSelected(ToolSelected.NONE)
    }
    this.props.setWeatherParam(weatherParam)
    this.props.setToolClickLocation(null)
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
  setWeatherParam,
  setToolClickLocation,
  setUpdatingPlanId,
  toggleGps,
}

export default connect(mapStateToProps, actionCreators)(TopNav)
