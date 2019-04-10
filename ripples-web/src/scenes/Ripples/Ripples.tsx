import React, { Component, ChangeEvent } from 'react'
import 'react-notifications/lib/notifications.css';
const { NotificationManager } = require('react-notifications');
import { fetchSoiData, fetchProfileData, fetchAwareness, sendPlanToVehicle } from '../../services/SoiUtils'
import './styles/Ripples.css'
import TopNav from './components/TopNav';
import Slider from './components/Slider';
import { fetchAisData } from '../../services/AISUtils';
import { estimatePositionsAtDeltaTime } from '../../services/PositionUtils';
import IAsset from '../../model/IAsset';
import IAisShip from '../../model/IAisShip';
import { connect } from 'react-redux';
import { setVehicles, setSpots, setAis, editPlan, setSlider, cancelEditPlan, setUser } from '../../redux/ripples.actions';
import IRipplesState from '../../model/IRipplesState';
import RipplesMap from './components/RipplesMap';
import UserState, { IUser } from '../../model/IAuthState';
import { getCurrentUser } from '../../services/AuthUtils';


type stateType = {};

type propsType = {
  setVehicles: Function
  setSpots: Function
  setAis: Function
  setSlider: Function
  editPlan: Function
  setUser: (user: IUser) => any
  cancelEditPlan: Function
  selectedVehicle: IAsset
  sliderValue: number
  auth: UserState
}


class Ripples extends Component<propsType, stateType> {

  soiTimer: number = 0
  aisTimer: number = 0

  constructor(props: any) {
    super(props);

    this.handleCancelEditPlan = this.handleCancelEditPlan.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.onSliderChange = this.onSliderChange.bind(this)
    this.handleSendPlanToVehicle = this.handleSendPlanToVehicle.bind(this)
    this.stopUpdates = this.stopUpdates.bind(this)
    this.startUpdates = this.startUpdates.bind(this)
    this.updateSoiData = this.updateSoiData.bind(this)
    this.updateAISData = this.updateAISData.bind(this)
    this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this)
  }

  async loadCurrentlyLoggedInUser() {
    try {
      const user: IUser = await getCurrentUser()
      this.props.setUser(user)
      NotificationManager.info(`${user.role.toLowerCase()}: ${user.email}`)
    } catch (error) {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  }

  async componentDidMount() {
    await this.loadCurrentlyLoggedInUser()
    this.startUpdates();
  }

  stopUpdates() {
    console.log("Stop updates called")
    clearInterval(this.soiTimer);
    clearInterval(this.aisTimer);
  }

  startUpdates(e?: any) {
    console.log("Start updates called", e)
    this.updateSoiData();
    this.updateAISData();
    if (!this.soiTimer) {
      this.soiTimer = window.setInterval(this.updateSoiData, 60000);
    }
    if (!this.aisTimer) {
      this.aisTimer = window.setInterval(this.updateAISData, 60000); //get ais data every minute
    }
  }

  componentWillUnmount() {
    clearInterval(this.soiTimer);
    clearInterval(this.aisTimer)
  }

  async updateSoiData() {
    try {
      const soiData = await fetchSoiData(this.props.auth)
      let vehicles = soiData.vehicles;

      // fetch profiles
      let profiles = await fetchProfileData();
      profiles = profiles.filter(p =>
        p.samples.length > 0 &&
        vehicles.filter(v => v.name == p.system).length == 1
      )
      // get vehicle which uploded profiles
      profiles.forEach(p => {
        const uploader = vehicles.filter((v) => v.name == p.system)[0];
        uploader.plan.profiles.push(p)
      })

      // fetch soi awareness
      const assetsAwareness = await fetchAwareness()
      assetsAwareness.forEach(assetAwareness => {
        let vehicle = vehicles.find(v => v.name === assetAwareness.name)
        if (vehicle) {
          vehicle.awareness = assetAwareness.positions
        }
      })
      // update redux store
      this.props.setVehicles(soiData.vehicles);
      this.props.setSpots(soiData.spots)
    } catch (error) {
      NotificationManager.warning('Failed to fetch data')
      console.error(error)
    }
  }

  async updateAISData() {
    const deltaHours = 12
    let shipsData: IAisShip[] = await fetchAisData()
    shipsData.forEach(ship => {
      ship.awareness = estimatePositionsAtDeltaTime(ship, deltaHours)
    })
    // update redux store
    this.props.setAis(shipsData)

  }

  handleEditPlan = (planId: string) => {
    this.props.editPlan(planId)
    this.stopUpdates();
  }

  handleSendPlanToVehicle() {
    sendPlanToVehicle(this.props.selectedVehicle)
      .then(([responseOk, body]: (boolean | any)) => {
        if (!responseOk) {
          NotificationManager.warning(
            body.message,
          );
          this.handleCancelEditPlan();
        } else {
          NotificationManager.success(
            body.message,
          );
          this.startUpdates();
        }
      })
      .catch(error => {
        // handles fetch errors
        NotificationManager.warning(
          error.message,
        );
        this.handleCancelEditPlan();
      });
  }

  handleCancelEditPlan() {
    this.startUpdates();
    this.props.cancelEditPlan()
  }

  onSliderChange(sliderValue: number) {
    if (sliderValue === 0) {
      // reset state
      this.startUpdates()
    } else {
      this.stopUpdates()
    }
    this.props.setSlider(sliderValue)
  }

  freedrawRef = React.createRef();

  render() {
    return (
      <div>
        <div className="navbar">
          <TopNav
            handleEditPlan={this.handleEditPlan}
            handleSendPlanToVehicle={this.handleSendPlanToVehicle}
            handleCancelEditPlan={this.handleCancelEditPlan}
          >
          </TopNav>
        </div>
        <RipplesMap></RipplesMap>
        <Slider onChange={this.onSliderChange} min={-12} max={12} value={this.props.sliderValue}></Slider>
      </div>

    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    selectedVehicle: state.selectedVehicle,
    sliderValue: state.sliderValue,
    auth: state.auth
  }
}


const actionCreators = {
  setVehicles,
  setSpots,
  setAis,
  editPlan,
  cancelEditPlan,
  setSlider,
  setUser
}

export default connect(mapStateToProps, actionCreators)(Ripples)