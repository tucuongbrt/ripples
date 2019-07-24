import { Message } from '@stomp/stompjs'
import React, { Component } from 'react'
import 'react-notifications/lib/notifications.css'
import { connect } from 'react-redux'
import IAisShip from '../../model/IAisShip'
import IAsset, { IAssetPayload } from '../../model/IAsset'
import UserState, { isScientist, IUser } from '../../model/IAuthState'
import IPlan, { isPlanEqual } from '../../model/IPlan'
import IProfile from '../../model/IProfile'
import IRipplesState from '../../model/IRipplesState'
import {
  addNewPlan,
  cancelEditPlan,
  editPlan,
  savePlan,
  setAis,
  setCcus,
  setPlans,
  setProfiles,
  setSlider,
  setSpots,
  setUser,
  setVehicles,
  updateAIS,
  updateCCU,
  updatePlan,
  updateSpot,
  updateVehicle,
} from '../../redux/ripples.actions'
import AISService from '../../services/AISUtils'
import { getCurrentUser } from '../../services/AuthUtils'
import { timestampMsToReadableDate } from '../../services/DateUtils'
import {
  convertAssetPayloadToAsset,
  convertAssetPayloadToPlan,
  deleteUnassignedPlan,
  fetchAwareness,
  fetchProfileData,
  fetchSoiData,
  fetchUnassignedPlans,
  mergeAssetSettings,
  sendPlanToVehicle,
  sendUnassignedPlan,
  updatePlanId,
} from '../../services/SoiUtils'
import WSService from '../../services/WebSocketService'
import RipplesMap from './components/RipplesMap'
import SidePanel from './components/SidePanel'
import Slider from './components/Slider'
import TopNav from './components/TopNav'
import './styles/Ripples.css'
const { NotificationManager } = require('react-notifications')
const toGeojson = require('@mapbox/togeojson')

interface StateType {
  loading: boolean
  myMapsData: any
}

interface PropsType {
  plans: IPlan[]
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
  selectedPlan: IPlan
  sliderValue: number
  auth: UserState
  vehicleSelected: string
}

class Ripples extends Component<PropsType, StateType> {
  public soiTimer: number = 0
  public aisTimer: number = 0
  private webSocketsService: WSService = new WSService()
  private aisService: AISService = new AISService()

  constructor(props: any) {
    super(props)
    this.state = {
      loading: true,
      myMapsData: {},
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
    this.handleAssetUpdate = this.handleAssetUpdate.bind(this)
    this.handleAISUpdate = this.handleAISUpdate.bind(this)
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
    this.webSocketsService.subscribeWSUpdates(this.handleAssetUpdate, this.handleAISUpdate)
    this.setState({ myMapsData: myMaps })
    this.setState({ loading: false })
    this.startUpdates()
  }

  public handleAISUpdate(m: Message) {
    if (m.body) {
      const aisShipsPayload: IAisShip[] = JSON.parse(m.body)
      const aisShips = aisShipsPayload.map(s => this.aisService.convertAISToRipples(s))
      aisShips.forEach(s => {
        this.props.updateAIS(s)
      })
    }
  }

  public handleAssetUpdate(m: Message) {
    if (m.body) {
      const newSystem: IAssetPayload = JSON.parse(m.body)
      const system: IAsset = convertAssetPayloadToAsset(newSystem)
      if (system.name.startsWith('spot')) {
        this.props.updateSpot(system)
      } else if (system.name.startsWith('ccu')) {
        this.props.updateCCU(system)
      } else {
        this.props.updateVehicle(system)
      }

      if (newSystem.plan) {
        if (newSystem.plan.waypoints.length > 0) {
          const plan: IPlan = convertAssetPayloadToPlan(newSystem)
          this.props.updatePlan(plan)
        }
      }
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
    this.webSocketsService.activate()
  }

  public componentWillUnmount() {
    this.stopUpdates()
  }

  public async loadMyMapsData() {
    const apiURL = process.env.REACT_APP_API_BASE_URL
    const res = await fetch(`${apiURL}/kml`)
    const xml = await res.text()
    // Create new kml overlay
    const dom = new DOMParser().parseFromString(xml, 'text/xml')
    const featureCollection = toGeojson.kml(dom, { styles: true })
    return featureCollection
  }

  public async updateSoiData() {
    try {
      const soiPromise = fetchSoiData()
      const profilesPromise = fetchProfileData()
      const awarenessPromise = fetchAwareness()
      let unassignedPlansPromise
      if (isScientist(this.props.auth)) {
        unassignedPlansPromise = fetchUnassignedPlans()
      }
      const soiData = await soiPromise

      const vehicles = soiData.vehicles
      await mergeAssetSettings(vehicles, this.props.auth)

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
      description: `Plan created by ${this.props.auth.currentUser.email} on ${timestampMsToReadableDate(Date.now())}`,
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
      const body = await sendPlanToVehicle(plan, vehicle)
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
        const response = await sendUnassignedPlan(plan)
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
      await updatePlanId(previousId, newId)
      NotificationManager.success(`Plan id has been updated`)
    } catch (error) {
      NotificationManager.warning(error.message)
    }
  }

  public async handleDeletePlan() {
    try {
      await deleteUnassignedPlan(this.props.selectedPlan.id)
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
          <RipplesMap myMapsData={this.state.myMapsData} />
          <SidePanel />
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
    vehicleSelected: state.vehicleSelected,
  }
}

const actionCreators = {
  addNewPlan,
  cancelEditPlan,
  editPlan,
  savePlan,
  setAis,
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
}

export default connect(
  mapStateToProps,
  actionCreators
)(Ripples)
