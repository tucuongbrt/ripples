import React, { Component } from 'react'
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
import { getCurrentUser } from '../../services/AuthUtils'
import { timeFromNow, timestampMsToReadableDate } from '../../services/DateUtils'
import { distanceInMetersBetweenCoords } from '../../services/PositionUtils'
import { deleteAssetErrors, fetchAssetsErrors, fetchCollisions, fetchSoiData } from '../../services/SoiUtils'
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
  loading: boolean
}

interface PropsType {
  setUser: (user: IUser) => any
  auth: IAuthState
}

class SoiRisk extends Component<PropsType, StateType> {
  public timerID: number = 0
  public rootCoords: ILatLng = { latitude: 41.18, longitude: -8.7 }

  constructor(props: any) {
    super(props)
    this.state = {
      assetErrors: [],
      collisions: [],
      isCollisionsModalOpen: false,
      isErrorsModalOpen: false,
      loading: true,
      plans: [],
      vehicles: [],
    }
    this.updateSoiData = this.updateSoiData.bind(this)
    this.buildAllVehicles = this.buildAllVehicles.bind(this)
    this.buildVehicleCollisions = this.buildVehicleCollisions.bind(this)
    this.buildVehicleErrors = this.buildVehicleErrors.bind(this)
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
      await deleteAssetErrors(assetName)
      this.updateSoiData()
    } catch (e) {
      NotificationManager.warning('Failed to fetch data')
    }
  }

  public async updateSoiData() {
    const soiData = await fetchSoiData()
    const collisions = await fetchCollisions()
    const errors = await fetchAssetsErrors()
    this.setState({
      assetErrors: errors,
      collisions,
      plans: soiData.plans,
      vehicles: soiData.vehicles,
    })
  }

  public getNextWaypointIdx(vehicle: IAsset, plan: IPlan) {
    const waypoints = plan.waypoints
    if (waypoints.length === 0) {
      return -1
    }
    const lastCommTimestamp = vehicle.lastState.timestamp
    const timeIntervals = waypoints.map(wp => Math.abs(wp.timestamp - lastCommTimestamp))
    const minInterval = Math.min(...timeIntervals)
    const minIntervalIdx = timeIntervals.findIndex(d => d === minInterval)
    const minIntervalWP = waypoints[minIntervalIdx]
    // distance in meters
    const distanceToMinInterval = distanceInMetersBetweenCoords(minIntervalWP, vehicle.lastState)
    // if distance is less than 100m, let's consider that the vehicle already arrived to that waypoint
    if (distanceToMinInterval < 100) {
      return waypoints.length > minIntervalIdx + 1 ? minIntervalIdx + 1 : minIntervalIdx
    }
    return minIntervalIdx
  }

  public getDistanceToVehicle(vehicle: IAsset): string {
    return distanceInMetersBetweenCoords(vehicle.lastState, this.rootCoords).toFixed(3)
  }

  public buildTimeForNextWaypoint(waypoints: IPositionAtTime[], nextWaypointIdx: number) {
    if (nextWaypointIdx >= 0 && nextWaypointIdx < waypoints.length) {
      return <td className="bg-green">{timeFromNow(waypoints[nextWaypointIdx].timestamp)}</td>
    }
    return <td className="bg-red">N/D</td>
  }

  public buildLastCommunication(timestamp: number) {
    const greenTreshold = 15 * 60 * 1000
    const orangeTreshold = 30 * 60 * 1000
    const deltaTime = Date.now() - timestamp
    return (
      <td className={deltaTime < greenTreshold ? 'bg-green' : deltaTime < orangeTreshold ? 'bg-orange' : 'bg-red'}>
        {timeFromNow(timestamp)}
      </td>
    )
  }

  public buildFuel(fuel: number) {
    return <td className={fuel > 0.5 ? 'bg-green' : fuel > 0.1 ? 'bg-orange' : 'bg-red'}>{fuel}</td>
  }

  public buildVehicle(vehicle: IAsset) {
    const vehiclePlan: IPlan | undefined = this.state.plans.find(p => p.id === vehicle.planId)
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
    return this.state.vehicles.map(vehicle => this.buildVehicle(vehicle))
  }

  public toggleCollisionsModal() {
    this.setState(prevState => ({
      isCollisionsModalOpen: !prevState.isCollisionsModalOpen,
    }))
  }

  public toggleErrorsModal() {
    this.setState(prevState => ({
      isErrorsModalOpen: !prevState.isErrorsModalOpen,
    }))
  }

  public buildVehicleCollisions(assetName: string) {
    const allCollisions = this.state.collisions
    const assetCollisions = allCollisions.filter(c => c.asset === assetName)
    assetCollisions.sort((a, b) => a.timestamp - b.timestamp)
    return (
      <td className={assetCollisions.length === 0 ? 'bg-green' : 'bg-red'}>
        <div>
          <Button onClick={this.toggleCollisionsModal}>{assetCollisions.length}</Button>
          <Modal
            key={assetName + '_collisionsModal'}
            isOpen={this.state.isCollisionsModalOpen}
            toggle={this.toggleCollisionsModal}
          >
            <ModalHeader toggle={this.toggleCollisionsModal}>{assetName} collisions</ModalHeader>
            <ModalBody>
              {assetCollisions.map((c: IPotentialCollision) => {
                return (
                  <div key={`collision_at_${c.timestamp}`}>
                    <ul>
                      <li>Ship: {c.ship}</li>
                      <li>Distance: {c.distance.toFixed(2)}m</li>
                      <li>time: {timestampMsToReadableDate(c.timestamp)}</li>
                    </ul>
                    <hr />
                  </div>
                )
              })}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggleCollisionsModal}>
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
    const assetErrors = allErrors.find(e => e.getName() === assetName)
    if (!assetErrors) {
      return <td className="bg-green">0</td>
    }
    const errors = assetErrors.getErrors()
    return (
      <td className={errors.length === 0 ? 'bg-green' : 'bg-red'}>
        <div>
          <Button onClick={this.toggleErrorsModal}>{errors.length}</Button>
          <Modal key={assetName + '_errorsModal'} isOpen={this.state.isErrorsModalOpen} toggle={this.toggleErrorsModal}>
            <ModalHeader toggle={this.toggleErrorsModal}>{assetName} errors</ModalHeader>
            <ModalBody>
              {errors.map(e => {
                return (
                  <div key={`error_at_${e.timestamp}`}>
                    <ul>
                      <li>Message: {e.message}</li>
                      <li>Date: {timestampMsToReadableDate(e.timestamp)}</li>
                    </ul>
                    <hr />
                  </div>
                )
              })}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggleErrorsModal}>
                Close
              </Button>
              {isOperator(this.props.auth) ? (
                <Button color="primary" onClick={() => this.clearAssetErrors(assetName)}>
                  Clear
                </Button>
              ) : (
                <></>
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
              <th>Distance (Km)</th>
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

export default connect(
  mapStateToProps,
  actionCreators
)(SoiRisk)
