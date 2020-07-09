import React, { Component } from 'react'
import { geolocated, GeolocatedProps } from 'react-geolocated'
import { connect } from 'react-redux'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import { AssetErrors } from '../../model/AssetErrors'
import IAsset from '../../model/IAsset'
import IAuthState, { isOperator, IUser } from '../../model/IAuthState'
import ILatLng from '../../model/ILatLng'
import IPlan from '../../model/IPlan'
import IPositionAtTime from '../../model/IPositionAtTime'
import { IPotentialCollision } from '../../model/IPotentialCollision'
import IRipplesState from '../../model/IRipplesState'
import { setUser } from '../../redux/ripples.actions'
import { getCurrentUser } from '../../services/UserUtils'
import DateService from '../../services/DateUtils'
import PositionService from '../../services/PositionUtils'
import SoiService from '../../services/SoiUtils'
import TopNav from './components/TopNav'
import './styles/SoiRisk.css'

const { NotificationManager } = require('react-notifications')
interface StateType {
  vehicles: IAsset[]
  plans: IPlan[]
  collisions: IPotentialCollision[]
  assetErrors: AssetErrors[]
  isCollisionsModalOpen: boolean
  isErrorsModalOpen: boolean
  vehicleSelected: string
  loading: boolean
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

class SoiRisk extends Component<PropsType & GeolocatedProps, StateType> {
  public timerID: number = 0
  public defaultCoords: ILatLng = { latitude: 41.18, longitude: -8.7 }
  private positionService: PositionService = new PositionService()
  private soiService: SoiService = new SoiService()

  constructor(props: PropsType & GeolocatedProps) {
    super(props)
    this.state = {
      assetErrors: [],
      collisions: [],
      isCollisionsModalOpen: false,
      isErrorsModalOpen: false,
      loading: true,
      plans: [],
      vehicleSelected: '',
      vehicles: [],
    }
    this.updateSoiData = this.updateSoiData.bind(this)
    this.toggleCollisionsModal = this.toggleCollisionsModal.bind(this)
    this.toggleErrorsModal = this.toggleErrorsModal.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
  }
  public async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
    } catch (error) {
      localStorage.removeItem('ACCESS_TOKEN')
    }
  }
  public async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
    this.setState({ loading: false })
    this.updateSoiData()
    this.timerID = window.setInterval(this.updateSoiData, 60000) // get Soi data every minute
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public async clearAssetErrors(assetName: string) {
    try {
      await this.soiService.deleteAssetErrors(assetName)
      this.updateSoiData()
    } catch (e) {
      NotificationManager.warning('Failed to fetch data')
    }
  }

  public async updateSoiData() {
    const soiData = await this.soiService.fetchSoiData()
    const collisions = await this.soiService.fetchCollisions()
    const errors = await this.soiService.fetchAssetsErrors()
    this.setState({
      assetErrors: errors,
      collisions,
      plans: soiData.plans,
      vehicles: soiData.vehicles,
    })
  }

  /**
   * Calculate the index of the next waypoint. Returns -1 if there's no waypoint in the future.
   * @param vehicle
   * @param plan
   */
  public getNextWaypointIdx(vehicle: IAsset, plan: IPlan) {
    const waypoints = plan.waypoints
    if (waypoints.length === 0) {
      return -1
    }
    const lastCommTimestamp = vehicle.lastState.timestamp
    const timeIntervals = waypoints.map((wp) => Math.abs(wp.timestamp - lastCommTimestamp))
    const minInterval = Math.min(...timeIntervals)
    const minIntervalIdx = timeIntervals.findIndex((d) => d === minInterval)
    const minIntervalWP = waypoints[minIntervalIdx]
    if (minIntervalWP.timestamp === 0) {
      return -1
    }
    // distance in meters
    const distanceToMinInterval = this.positionService.distanceInMetersBetweenCoords(minIntervalWP, vehicle.lastState)
    // if distance is less than 100m, let's consider that the vehicle already arrived to that waypoint
    if (distanceToMinInterval < 100) {
      return waypoints.length > minIntervalIdx + 1 ? minIntervalIdx + 1 : minIntervalIdx
    }
    return minIntervalIdx
  }

  public getDistanceToVehicle(vehicle: IAsset): string {
    const rootCoords = this.props.coords
      ? { latitude: this.props.coords.latitude, longitude: this.props.coords.longitude }
      : this.defaultCoords
    return this.positionService.distanceInMetersBetweenCoords(vehicle.lastState, rootCoords).toFixed(1)
  }

  public buildTimeForNextWaypoint(waypoints: IPositionAtTime[], nextWaypointIdx: number) {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    if (nextWaypointIdx < 0) {
      return <td className="bg-red">N/D</td>
    }
    const nextWPTimestamp = waypoints[nextWaypointIdx].timestamp
    const color = nextWPTimestamp > now ? 'bg-green' : nextWPTimestamp > oneHourAgo ? 'bg-orange' : 'bg-red'
    if (nextWaypointIdx >= 0 && nextWaypointIdx < waypoints.length) {
      return <td className={color}>{DateService.timeFromNow(nextWPTimestamp)}</td>
    }
    return <td className="bg-red">N/D</td>
  }

  public buildLastCommunication(timestamp: number) {
    const greenTreshold = 15 * 60 * 1000
    const orangeTreshold = 30 * 60 * 1000
    const deltaTime = Date.now() - timestamp
    return (
      <td className={deltaTime < greenTreshold ? 'bg-green' : deltaTime < orangeTreshold ? 'bg-orange' : 'bg-red'}>
        {DateService.timeFromNow(timestamp)}
      </td>
    )
  }

  public buildFuel(fuel: number) {
    if (fuel === -1) {
      return <td className={'bg-red'}>N/D</td>
    }
    return <td className={fuel > 0.5 ? 'bg-green' : fuel > 0.1 ? 'bg-orange' : 'bg-red'}>{fuel.toFixed(2)}</td>
  }

  public buildVehicle(vehicle: IAsset) {
    const vehiclePlan: IPlan | undefined = this.state.plans.find(
      (p) => p.id === vehicle.planId && p.assignedTo === vehicle.name
    )
    if (!vehiclePlan) {
      return
    }
    const nextWaypointIdx = this.getNextWaypointIdx(vehicle, vehiclePlan)
    return (
      <tr key={vehicle.name}>
        <th scope="row">{vehicle.name}</th>
        {this.buildLastCommunication(vehicle.lastState.timestamp)}
        {this.buildTimeForNextWaypoint(vehiclePlan.waypoints, nextWaypointIdx)}
        {this.buildFuel(vehicle.lastState.fuel)}
        <td>{this.getDistanceToVehicle(vehicle)}</td>
        {this.buildVehicleCollisions(vehicle.name)}
        {this.buildVehicleErrors(vehicle.name)}
      </tr>
    )
  }

  public buildAllVehicles() {
    return this.state.vehicles.map((vehicle) => this.buildVehicle(vehicle))
  }

  public toggleCollisionsModal(assetName: string) {
    this.setState((prevState) => ({
      isCollisionsModalOpen: !prevState.isCollisionsModalOpen,
      vehicleSelected: assetName,
    }))
  }

  public toggleErrorsModal(assetName: string) {
    this.setState((prevState) => ({
      isErrorsModalOpen: !prevState.isErrorsModalOpen,
      vehicleSelected: assetName,
    }))
  }

  public buildVehicleCollisions(assetName: string) {
    const allCollisions = this.state.collisions
    const assetCollisions = allCollisions.filter((c) => c.asset === assetName)
    assetCollisions.sort((a, b) => a.timestamp - b.timestamp)
    if (assetCollisions.length === 0) {
      return <td className="bg-green">0</td>
    }
    return (
      <td className="bg-red">
        <div>
          <Button onClick={() => this.toggleCollisionsModal(assetName)}>{assetCollisions.length}</Button>
          <Modal
            key={assetName + '_collisionsModal'}
            isOpen={this.state.isCollisionsModalOpen && this.state.vehicleSelected === assetName}
            toggle={() => this.toggleCollisionsModal(assetName)}
          >
            <ModalHeader toggle={() => this.toggleCollisionsModal(assetName)}>{assetName} collisions</ModalHeader>
            <ModalBody>
              {assetCollisions.map((c: IPotentialCollision) => {
                return (
                  <div key={`collision_at_${c.timestamp}`}>
                    <ul>
                      <li>Ship: {c.ship}</li>
                      <li>Distance: {c.distance.toFixed(2)}m</li>
                      <li>time: {DateService.timestampMsToReadableDate(c.timestamp)}</li>
                    </ul>
                    <hr />
                  </div>
                )
              })}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => this.toggleCollisionsModal(assetName)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </td>
    )
  }

  public buildVehicleErrors(assetName: string) {
    const allErrors = this.state.assetErrors
    const assetErrors = allErrors.find((e) => e.getName() === assetName)
    if (!assetErrors) {
      return <td className="bg-green">0</td>
    }
    const errors = assetErrors.getErrors()
    return (
      <td className="bg-red">
        <div>
          <Button onClick={() => this.toggleErrorsModal(assetName)}>{errors.length}</Button>
          <Modal
            key={assetName + '_errorsModal'}
            isOpen={this.state.isErrorsModalOpen && this.state.vehicleSelected === assetName}
            toggle={() => this.toggleErrorsModal(assetName)}
          >
            <ModalHeader toggle={() => this.toggleErrorsModal(assetName)}>{assetName} errors</ModalHeader>
            <ModalBody>
              {errors.map((e) => {
                return (
                  <div key={`error_at_${e.timestamp}`}>
                    <ul>
                      <li>Message: {e.message}</li>
                      <li>Date: {DateService.timestampMsToReadableDate(e.timestamp)}</li>
                    </ul>
                    <hr />
                  </div>
                )
              })}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => this.toggleErrorsModal(assetName)}>
                Close
              </Button>
              {isOperator(this.props.auth) && (
                <Button color="primary" onClick={() => this.clearAssetErrors(assetName)}>
                  Clear
                </Button>
              )}
            </ModalFooter>
          </Modal>
        </div>
      </td>
    )
  }

  public render() {
    return (
      <>
        <TopNav />
        <Table responsive={true}>
          <thead>
            <tr>
              <th>Vehicle Name</th>
              <th>Last Comm</th>
              <th>Next Comm</th>
              <th>Fuel</th>
              <th>Distance (m)</th>
              <th>Collisions</th>
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>{this.buildAllVehicles()}</tbody>
        </Table>
      </>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    auth: state.auth,
  }
}

const actionCreators = {
  setUser,
}

export default connect(mapStateToProps, actionCreators)(geolocated()(SoiRisk))
