import { Message } from '@stomp/stompjs'
import React, { Component } from 'react'
import 'react-notifications/lib/notifications.css'
import { connect } from 'react-redux'
import IAisShip from '../../model/IAisShip'
import IAnnotation from '../../model/IAnnotations'
import IAsset, { IAssetPayload } from '../../model/IAsset'
import UserState, { isScientist, IUser, IUserLocation } from '../../model/IAuthState'
import IMyMap from '../../model/IMyMap'
import IPlan, { isPlanEqual } from '../../model/IPlan'
import IProfile from '../../model/IProfile'
import IRipplesState from '../../model/IRipplesState'
import IVehicleParams from '../../model/IVehicleParams'
import { ILogbook } from '../../model/MyLogbook'
import {
  addAnnotation,
  addNewPlan,
  cancelEditPlan,
  editPlan,
  savePlan,
  setAis,
  setAnnotations,
  setCcus,
  setPlans,
  setProfiles,
  setSlider,
  setSpots,
  setUser,
  setVehicles,
  toggleSliderChange,
  toggleVehicleModal,
  updateAIS,
  updateCCU,
  updatePlan,
  updateSpot,
  updateUserLocation,
  updateVehicle,
} from '../../redux/ripples.actions'
import AISService from '../../services/AISUtils'
import DateService from '../../services/DateUtils'
import KMLService from '../../services/KMLService'
import LogbookService from '../../services/LogbookUtils'
import SoiService from '../../services/SoiUtils'
import { getCurrentUser } from '../../services/UserUtils'
import WSService from '../../services/WebSocketService'
import RipplesMap from './components/RipplesMap'
import SidePanel from './components/SidePanel'
import Slider from './components/Slider'
import TopNav from './components/TopNav'
import './styles/Ripples.css'
const { NotificationManager } = require('react-notifications')

interface StateType {
  loading: boolean
  myMaps: IMyMap[]
}

interface PropsType {
  plans: IPlan[]
  selectedPlan: IPlan
  sliderValue: number
  auth: UserState
  vehicles: IAsset[]
  vehicleSelected: string
  setVehicles: (_: IAsset[]) => void
  setSpots: (_: IAsset[]) => void
  setCcus: (_: IAsset[]) => void
  setAis: (_: IAisShip[]) => void
  setPlans: (_: IPlan[]) => void
  setSlider: (_: number) => void
  editPlan: (_: IPlan) => void
  addNewPlan: (_: IPlan) => void
  setProfiles: (profiles: IProfile[]) => any
  setUser: (user: IUser) => any
  savePlan: () => void
  cancelEditPlan: () => void
  updateAIS: (s: IAisShip) => void
  updateVehicle: (v: IAsset) => void
  updateCCU: (ccu: IAsset) => void
  updateSpot: (spot: IAsset) => void
  updatePlan: (p: IPlan) => void
  addAnnotation: (a: IAnnotation) => void
  setAnnotations: (a: IAnnotation[]) => void
  updateUserLocation: (u: IUserLocation) => void
  toggleVehicleModal: () => void
  toggleSliderChange: () => void
}

class Ripples extends Component<PropsType, StateType> {
  public soiTimer: number = 0
  public aisTimer: number = 0
  private webSocketsService: WSService = new WSService()
  private aisService: AISService = new AISService()
  private kmlService: KMLService = new KMLService()
  private soiService: SoiService = new SoiService()
  private logbookService: LogbookService = new LogbookService()

  constructor(props: any) {
    super(props)
    this.state = {
      loading: true,
      myMaps: [],
    }
    this.handleCancelEditPlan = this.handleCancelEditPlan.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleStartNewPlan = this.handleStartNewPlan.bind(this)
    this.handleSavePlan = this.handleSavePlan.bind(this)
    this.handleDeletePlan = this.handleDeletePlan.bind(this)
    this.onSliderChange = this.onSliderChange.bind(this)
    this.handleSendPlanToVehicle = this.handleSendPlanToVehicle.bind(this)
    this.handleUpdatePlanId = this.handleUpdatePlanId.bind(this)
    this.stopUpdates = this.stopUpdates.bind(this)
    this.startUpdates = this.startUpdates.bind(this)
    this.updateSoiData = this.updateSoiData.bind(this)
    this.updateAISData = this.updateAISData.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
    this.handleWsAssetUpdate = this.handleWsAssetUpdate.bind(this)
    this.handleWsAISUpdate = this.handleWsAISUpdate.bind(this)
    this.handleWsAnnotationUpdate = this.handleWsAnnotationUpdate.bind(this)
    this.handleWsUserLocation = this.handleWsUserLocation.bind(this)
    this.handleWsVehicleParams = this.handleWsVehicleParams.bind(this)
    this.onSettingsClick = this.onSettingsClick.bind(this)
  }

  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
      NotificationManager.info(`${user.role.toLowerCase()}: ${user.email}`)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }

  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
    const myMaps = await this.loadMyMapsData()

    this.webSocketsService.createWSClient()
    this.webSocketsService.subscribeWSUpdates(
      this.handleWsAssetUpdate,
      this.handleWsAISUpdate,
      this.handleWsAnnotationUpdate,
      this.handleWsUserLocation,
      this.handleWsVehicleParams,
    )
    this.setState({ myMaps })
    this.setState({ loading: false })
    this.startUpdates()
  }

  public handleWsAnnotationUpdate(m: Message) {
    if (m.body) {
      const annotation: IAnnotation = JSON.parse(m.body)
      this.props.addAnnotation(annotation)
    }
  }

  public handleWsAISUpdate(m: Message) {
    if (m.body) {
      const aisShipPayload: IAisShip = JSON.parse(m.body)
      const aisShip = this.aisService.convertAISToRipples(aisShipPayload)
      this.props.updateAIS(aisShip)
    }
  }

  public handleWsAssetUpdate(m: Message) {
    if (m.body) {
      const newSystem: IAssetPayload = JSON.parse(m.body)
      const system: IAsset = this.soiService.convertAssetPayloadToAsset(newSystem)
      if (system.name.startsWith('spot')) {
        this.props.updateSpot(system)
      } else if (system.name.startsWith('ccu')) {
        this.props.updateCCU(system)
      } else {
        this.props.updateVehicle(system)
      }

      if (newSystem.plan) {
        if (newSystem.plan.waypoints.length > 0) {
          const plan: IPlan = this.soiService.convertAssetPayloadToPlan(newSystem)
          this.props.updatePlan(plan)
        }
      }
    }
  }

  public handleWsUserLocation(m: Message) {
    if (m.body) {
      const location: IUserLocation = JSON.parse(m.body)
      this.props.updateUserLocation(location)
    }
  }

  public handleWsVehicleParams(m: Message) {
    if (m.body) {
      const vehicleParams: IVehicleParams = JSON.parse(m.body)
      const index = this.props.vehicles.findIndex((v: IAsset) => v.name === vehicleParams.name)
      if (index === -1) {
        return
      }
      const vehicleCopy = JSON.parse(JSON.stringify(this.props.vehicles[index]))
      vehicleCopy.settings = Object.entries(vehicleParams.params)
      this.props.updateVehicle(vehicleCopy)
    }
  }

  public stopUpdates() {
    clearInterval(this.soiTimer)
    clearInterval(this.aisTimer)
    this.webSocketsService.deactivate()
  }

  public startUpdates() {
    this.updateSoiData()
    this.updateAISData()
    if (!this.soiTimer) {
      this.soiTimer = window.setInterval(this.updateSoiData, 60000)
    }
    if (!this.aisTimer) {
      this.aisTimer = window.setInterval(this.updateAISData, 60000) // get ais data every minute
    }
    this.fetchAllAnnotations()
    this.webSocketsService.activate()
  }

  public async fetchAllAnnotations() {
    try {
      const logbook: ILogbook = await this.logbookService.fetchLogbook()
      this.props.setAnnotations(logbook.annotations)
    } catch (e) {
      this.props.setAnnotations([])
    }
  }

  public componentWillUnmount() {
    this.stopUpdates()
  }

  public async loadMyMapsData(): Promise<IMyMap[]> {
    const mapNames: string[] = await this.kmlService.fetchMapsNames()
    const maps = Promise.all(
      mapNames.map(async mapName => {
        const mapData = await this.kmlService.fetchMapData(mapName)
        return { name: mapName, data: mapData }
      })
    )
    return await maps
  }

  public async updateSoiData() {
    try {
      const soiPromise = this.soiService.fetchSoiData()
      const profilesPromise = this.soiService.fetchProfileData()
      const awarenessPromise = this.soiService.fetchAwareness()
      let unassignedPlansPromise
      if (isScientist(this.props.auth)) {
        unassignedPlansPromise = this.soiService.fetchUnassignedPlans()
      }
      const soiData = await soiPromise

      const { vehicles, spots, ccus } = soiData
      await this.soiService.fetchSoiSettings([vehicles, spots, ccus])
      await this.soiService.mergeAssetSettings(vehicles, this.props.auth)

      // fetch profiles
      let profiles = await profilesPromise
      profiles = profiles.filter(p => p.samples.length > 0)
      // make heights symmetric
      profiles.forEach(p => {
        p.samples.forEach(a => (a[0] = -a[0]))
      })
      this.props.setProfiles(profiles)

      // fetch soi awareness
      const assetsAwareness = await awarenessPromise
      assetsAwareness.forEach(assetAwareness => {
        const vehicle = vehicles.find(v => v.name === assetAwareness.name)
        if (vehicle) {
          vehicle.awareness = assetAwareness.positions
        }
      })

      if (unassignedPlansPromise) {
        const unassignedPlans: IPlan[] = await unassignedPlansPromise
        soiData.plans = soiData.plans.concat(unassignedPlans)
      }
      // update redux store
      this.props.setVehicles(soiData.vehicles)
      this.props.setSpots(soiData.spots)
      this.props.setPlans(soiData.plans)
      this.props.setCcus(soiData.ccus)
    } catch (error) {
      NotificationManager.warning('Failed to fetch data')
    }
  }

  public async updateAISData() {
    const shipsData: IAisShip[] = await this.aisService.fetchAisData()
    // update redux store
    this.props.setAis(shipsData)
  }

  public handleEditPlan = (p: IPlan) => {
    this.props.editPlan(p)
    this.stopUpdates()
  }

  public handleStartNewPlan = (planId: string) => {
    const plan: IPlan = {
      assignedTo: '',
      description: `Plan created by ${this.props.auth.currentUser.email} on ${DateService.timestampMsToReadableDate(
        Date.now()
      )}`,
      id: planId,
      waypoints: [],
      visible: true,
      type: 'backseat',
    }
    this.props.addNewPlan(plan)
    this.stopUpdates()
  }

  public async handleSendPlanToVehicle() {
    try {
      const plan: IPlan | undefined = this.props.plans.find(p => isPlanEqual(p, this.props.selectedPlan))
      const vehicle = this.props.vehicleSelected
      if (!plan) {
        return
      }
      const body = await this.soiService.sendPlanToVehicle(plan, vehicle)
      NotificationManager.success(body.message)
      this.startUpdates()
    } catch (error) {
      NotificationManager.warning(error.message)
      this.handleCancelEditPlan()
    }
  }

  public handleCancelEditPlan() {
    this.props.cancelEditPlan()
    this.startUpdates()
  }

  public async handleSavePlan() {
    // send plan to server
    const plan: IPlan | undefined = this.props.plans.find(p => isPlanEqual(p, this.props.selectedPlan))
    if (plan) {
      try {
        const response = await this.soiService.sendUnassignedPlan(plan)
        this.startUpdates()
        this.props.savePlan()
        NotificationManager.success(response.message)
      } catch (error) {
        NotificationManager.warning(error.message)
      }
    }
  }

  public async handleUpdatePlanId(previousId: string, newId: string) {
    try {
      await this.soiService.updatePlanId(previousId, newId)
      NotificationManager.success(`Plan id has been updated`)
    } catch (error) {
      NotificationManager.warning(error.message)
    }
  }

  public async handleDeletePlan() {
    try {
      await this.soiService.deleteUnassignedPlan(this.props.selectedPlan.id)
      NotificationManager.success(`Plan ${this.props.selectedPlan.id} has been deleted`)
    } catch (error) {
      NotificationManager.warning(error.message)
    } finally {
      this.props.savePlan() // used to deselect the plan
      this.startUpdates()
    }
  }

  public onSliderChange(sliderValue: number) {
    if (sliderValue === 0) {
      // reset state
      this.startUpdates()
    } else {
      this.stopUpdates()
    }
    this.props.setSlider(sliderValue)
    this.props.toggleSliderChange()
  }

  public onSettingsClick() {
    this.props.toggleVehicleModal()
  }

  public render() {
    if (!this.state.loading) {
      return (
        <div>
          <div className="navbar">
            <TopNav
              handleEditPlan={this.handleEditPlan}
              handleSendPlanToVehicle={this.handleSendPlanToVehicle}
              handleCancelEditPlan={this.handleCancelEditPlan}
              handleStartNewPlan={this.handleStartNewPlan}
              handleSavePlan={this.handleSavePlan}
              handleDeletePlan={this.handleDeletePlan}
              handleUpdatePlanId={this.handleUpdatePlanId}
            />
          </div>
          <RipplesMap myMaps={this.state.myMaps} onSettingsClick={this.onSettingsClick} />
          <SidePanel onSettingsClick={this.onSettingsClick} />
          <Slider onChange={this.onSliderChange} min={-12} max={12} value={this.props.sliderValue} />
        </div>
      )
    }

    return <></>
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
    plans: state.planSet,
    selectedPlan: state.selectedPlan,
    sliderValue: state.sliderValue,
    vehicles: state.assets.vehicles,
    vehicleSelected: state.vehicleSelected,
  }
}

const actionCreators = {
  addAnnotation,
  addNewPlan,
  cancelEditPlan,
  editPlan,
  savePlan,
  setAis,
  setAnnotations,
  setCcus,
  setPlans,
  setProfiles,
  setSlider,
  setSpots,
  setUser,
  setVehicles,
  updateVehicle,
  updateSpot,
  updateCCU,
  updatePlan,
  updateAIS,
  updateUserLocation,
  toggleSliderChange,
  toggleVehicleModal,
}

export default connect(
  mapStateToProps,
  actionCreators
)(Ripples)
