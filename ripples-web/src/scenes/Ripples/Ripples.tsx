import React, { Component, ChangeEvent } from 'react'

import { fetchSoiData, fetchProfileData, fetchAwareness, sendPlanToVehicle } from '../../services/SoiUtils'
import './styles/Ripples.css'
import TopNav from './components/TopNav';
import Slider from './components/Slider';
import 'react-leaflet-fullscreen-control'
import { fetchAisData } from '../../services/AISUtils';
import { estimatePositionsAtDeltaTime } from '../../services/PositionUtils';
import IAsset from '../../model/IAsset';
import IAisShip from '../../model/IAisShip';
import NotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';
import { setVehicles, setSpots, setAis, editPlan, setSlider, cancelEditPlan } from '../../redux/ripples.actions';
import IRipplesState from '../../model/IRipplesState';
import RipplesMap from './components/RipplesMap';



type stateType = {};

type propsType = {
  setVehicles: Function
  setSpots: Function
  setAis: Function
  setSlider: Function
  editPlan: Function
  cancelEditPlan: Function
  selectedVehicle: IAsset
  sliderValue: number
}


class Ripples extends Component<propsType, stateType> {

  soiTimer: number = 0
  aisTimer: number = 0
  _notificationSystem: any = null

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
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    this.startUpdates();
  }

  stopUpdates() {
    clearInterval(this.soiTimer);
    clearInterval(this.aisTimer);
  }

  startUpdates() {
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
      const soiData = await fetchSoiData()
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
      this._notificationSystem.addNotification({
        message: 'Failed to fetch data',
        level: 'warning'
      });
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
          this._notificationSystem.addNotification({
            success: body.message,
            level: 'warning'
          });
          this.handleCancelEditPlan();
        } else {
          this._notificationSystem.addNotification({
            success: body.message,
            level: 'success'
          });
          this.startUpdates();
        }
      })
      .catch(error => {
        // handles fetch errors
        this._notificationSystem.addNotification({
          success: error.message,
          level: 'warning'
        });
        this.handleCancelEditPlan();
      });
  }

  handleCancelEditPlan() {
    this.startUpdates();
    this.props.cancelEditPlan()
  }

  onSliderChange(event: ChangeEvent<HTMLInputElement>) {
    let sliderValue = +event.target.value
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
        <NotificationSystem ref="notificationSystem" />
      </div>

    )
  }
}

function mapStateToProps(state: IRipplesState) {
  const {selectedVehicle, sliderValue} = state
  return { 
    selectedVehicle: selectedVehicle,
    sliderValue: sliderValue
  }
}


const actionCreators = {
  setVehicles,
  setSpots,
  setAis,
  editPlan,
  cancelEditPlan,
  setSlider,
}

export default connect(mapStateToProps, actionCreators)(Ripples)