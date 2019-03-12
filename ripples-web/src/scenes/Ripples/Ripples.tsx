import React, { Component, ReactInstance, ChangeEvent } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl, LatLng } from 'react-leaflet'
import Vehicle from './components/Vehicle'
import Spot from './components/Spot'
import VehiclePlan from './components/VehiclePlan'
import MeasureArea from './components/MeasureArea'
import { fetchSoiData, fetchProfileData, fetchAwareness, sendPlanToVehicle } from '../../services/SoiUtils'
import './styles/Ripples.css'
import VerticalProfile from './components/VerticalProfile';
import TopNav from './components/TopNav';
import Slider from './components/Slider';
import 'react-leaflet-fullscreen-control'
import AISShip from './components/AISShip';
import { fetchAisData } from '../../services/AISUtils';
import { distanceInKmBetweenCoords } from '../../services/PositionUtils';
import IProfile from '../../model/IProfile';
import IAsset from '../../model/IAsset';
import IAisShip from '../../model/IAisShip';
import SoiAwareness from './components/SoiAwareness';
import ISoiAwareness from '../../model/ISoiAwareness';
import IPositionAtTime from '../../model/IPositionAtTime';
import IPair from '../../model/IPair';
import { LatLngLiteral } from 'leaflet';
import NotificationSystem from 'react-notification-system';

const { BaseLayer, Overlay } = LayersControl

type stateType = {
  vehiclePlanPairs: IPair<string>[],
  vehicles: IAsset[],
  previousVehicles: IAsset[],
  spots: IAsset[],
  profiles: IProfile[],
  aisShips: IAisShip[],
  selectedPlan: string,
  freeDrawPolygon: any[],
  sidebarOpen: boolean,
  soiAwareness: ISoiAwareness[],
  sliderValue: number
  drawAwareness: boolean
  wpSelected: number
};

export default class Ripples extends Component<{}, stateType> {

  initCoords: LatLngLiteral = {lat: 41.18, lng: -8.7,}
  initZoom: number = 10
  soiTimer: number = 0
  aisTimer: number = 0
  _notificationSystem: any = null

  constructor(props: any) {
    super(props);
    this.state = {
      vehiclePlanPairs: [],
      vehicles: [],
      previousVehicles: [],
      spots: [],
      profiles: [],
      aisShips: [],
      selectedPlan: '',
      freeDrawPolygon: [],
      sidebarOpen: true,
      soiAwareness: [],
      sliderValue: 0,
      drawAwareness: false,
      wpSelected: -1
    }

    this.handleCancelEditPlan = this.handleCancelEditPlan.bind(this)
    this.drawVehicles = this.drawVehicles.bind(this)
    this.drawSpots = this.drawSpots.bind(this)
    this.drawPlans = this.drawPlans.bind(this)
    this.drawProfiles = this.drawProfiles.bind(this)
    this.handleDeleteMarker = this.handleDeleteMarker.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleMapClick = this.handleMapClick.bind(this)
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

  updateSoiData() {
    fetchSoiData()
      .then(soiData => {
        this.setState({ vehicles: soiData.vehicles, spots: soiData.spots })
        this.setState({ vehiclePlanPairs: soiData.vehicles.filter(v => v.plan.waypoints.length > 0)
          .map(v => { 
            return {first: v.name, second: v.plan.id}
          })
        })
      })
      .catch(error => {
        this._notificationSystem.addNotification({
          message: 'Failed to fetch soi data',
          level: 'warning'
        });
      })
    fetchProfileData().then((profiles: IProfile[]) => {
      this.setState({ profiles: profiles.filter(p => p.samples.length > 0) })
    }).catch(error => {
      this._notificationSystem.addNotification({
        message: 'Failed to fetch profiles data',
        level: 'warning'
      });
    })
    fetchAwareness().then(assetsPositions => {
      this.setState({ soiAwareness: assetsPositions })
    }).catch(error => {
      this._notificationSystem.addNotification({
        message: 'Failed to fetch awareness data',
        level: 'warning'
      });
    })
  }
  updateAISData() {
    fetchAisData().then((shipsData: IAisShip[]) => {
      console.log('Fetched aisShips', shipsData);
      this.setState({ aisShips: shipsData })
    })
  }

  drawVehicles() {
    let vehicles: any[] = [];
    this.state.vehicles.forEach(vehicle => {
      vehicles.push(
        <Vehicle key={vehicle.imcid} lastState={vehicle.lastState} name={vehicle.name}></Vehicle>
      )
    })
    if (this.state.drawAwareness === true) {
      const deltaHours = this.state.sliderValue
      this.state.soiAwareness.forEach(vehicle => {
        vehicles.push(
          <SoiAwareness awareness={vehicle} deltaHours={deltaHours}></SoiAwareness>
        )
      })
    }
    return vehicles;
  }

  drawPlans() {
    let plans: any[] = [];
    let selectedPlan = this.state.selectedPlan;
    this.state.vehicles.filter(vehicle => vehicle.plan.waypoints.length > 0).forEach(vehicle => {
      const plan = vehicle.plan;
      plans.push(
        <VehiclePlan
          key={"VehiclePlan" + plan.id}
          plan={plan}
          vehicle={vehicle.name}
          isMovable={plan.id === selectedPlan}
          handleMarkerClick={this.handleMarkerClick}
          handleDeleteMarker={this.handleDeleteMarker}
          wpSelected={this.state.wpSelected}
        >
        </VehiclePlan>
      )
    })
    return plans;
  }

  drawSpots() {
    let spots: any[] = [];
    this.state.spots.forEach(spot => {
      spots.push(
        <Spot key={spot.imcid} data={spot}></Spot>
      )
    })
    return spots;
  }

  drawProfiles() {
    let profiles: any[] = [];
    this.state.profiles.forEach((profile, i) => {
      profiles.push(
        <VerticalProfile key={"profile" + i} data={profile}></VerticalProfile>
      )
    })
    return profiles;
  }

  drawAISData() {
    let ships: any[] = [];
    this.state.aisShips.forEach(ship => {
      ships.push(
        <AISShip key={"Ship_" + ship.mmsi} data={ship}></AISShip>
      )
    })
    return ships;
  }

  handleModeChange = (event: any) => {
    console.log(event)
  }

  handleEditPlan = (planId: string) => {
    console.log('Update plan: ', planId);
    // enable drag on markers of the plan
    this.setState({
      selectedPlan: planId,
      previousVehicles: JSON.parse(JSON.stringify(this.state.vehicles)),
    })
    this.stopUpdates();
  }

  handleMarkerClick(planId: string, markerIdx: number, isMovable: boolean) {

    if (isMovable && planId === this.state.selectedPlan) {
      this.setState({
        wpSelected: markerIdx,
      })
    }
  }

  handleDeleteMarker(planId: string, markerIdx: number) {
    const selectedPlan = this.state.selectedPlan;
    if (planId === selectedPlan) {
      let vehicles = this.state.vehicles.slice();
      const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
      vehicles[vehicleIdx].plan.waypoints.splice(markerIdx, 1);
      this.updateWaypointsTimestampFromIndex(vehicles[vehicleIdx].plan.waypoints, markerIdx);
      this.setState({ vehicles: vehicles });
    }
  }

  handleMapClick(e: any) {
    const selectedPlan = this.state.selectedPlan;
    const wpSelected = this.state.wpSelected;
    if (wpSelected >= 0 && selectedPlan != null) {
      const newLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      this.setState({ wpSelected: -1 })
      // update waypoints locally
      let vehicles = this.state.vehicles.slice();
      const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
      vehicles[vehicleIdx].plan.waypoints[wpSelected] = Object.assign({}, newLocation, { timestamp: 0 })
      this.updateWaypointsTimestampFromIndex(vehicles[vehicleIdx].plan.waypoints, wpSelected);
      this.setState({ vehicles: vehicles })
    }
  }

  getSpeedBetweenWaypoints(waypoints: IPositionAtTime[]) {
    if (waypoints.length < 2) return 1;
    let firstWp = waypoints[0];
    let secondWp = waypoints[1];
    const distanceInMeters = distanceInKmBetweenCoords(firstWp, secondWp) * 1000;
    const deltaSec = (secondWp.timestamp - firstWp.timestamp) / 1000;
    return distanceInMeters / deltaSec;
  }

  updateWaypointsTimestampFromIndex(waypoints: IPositionAtTime[], firstIndex: number) {
    if (firstIndex <= 0 || firstIndex >= waypoints.length) {
      return;
    }
    const speed = this.getSpeedBetweenWaypoints(waypoints)
    const lastIndex = waypoints.length - 1;
    for (let i = firstIndex; i <= lastIndex; i++) {
      let prevWp = waypoints[i - 1];
      let currentWp = waypoints[i];
      const distanceInMeters = distanceInKmBetweenCoords(prevWp, currentWp) * 1000;
      currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000; // timestamp is saved in ms
    }

  }

  handleSendPlanToVehicle() {
    sendPlanToVehicle(this.state.selectedPlan, this.state.vehicles)
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
    const prevVehicles = JSON.parse(JSON.stringify(this.state.previousVehicles))
    this.startUpdates();
    this.setState({
      vehicles: prevVehicles,
      previousVehicles: [],
      selectedPlan: '',
    });
  }

  onSliderChange(event: ChangeEvent<HTMLInputElement>) {
    let sliderValue = +event.target.value
    if (sliderValue === 0) {
      // reset state
      this.startUpdates()
      this.setState({ drawAwareness: false })
    } else {
      this.stopUpdates()
      this.setState({ drawAwareness: true })
    }
    this.setState({ sliderValue: sliderValue })
    console.log("Slider new value", sliderValue)
  }

  freedrawRef = React.createRef();

  render() {
    return (
      <div>
        <div className="navbar">
          <TopNav
            vehiclePlanPairs={this.state.vehiclePlanPairs}
            handleEditPlan={this.handleEditPlan}
            handleSendPlanToVehicle={this.handleSendPlanToVehicle}
            handleCancelEditPlan={this.handleCancelEditPlan}>
          </TopNav>
        </div>
        <div className="map">
          <Map fullscreenControl center={this.initCoords} zoom={this.initZoom} onClick={this.handleMapClick}>
            <LayersControl position="topright">
              <BaseLayer checked name="OpenStreetMap.Mapnik">
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <Overlay checked name="Nautical charts">
                <TileLayer
                  url='http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4'
                  attribution='Map data &copy; Transas Nautical Charts'
                  tms={true}
                  maxZoom={21}
                  opacity={0.7}
                  maxNativeZoom={17}>
                </TileLayer>
              </Overlay>
              <Overlay checked name="Vehicles">
                <LayerGroup>
                  {this.drawVehicles()}
                </LayerGroup>
              </Overlay>
              <Overlay checked name="Spots">
                <LayerGroup>
                  {this.drawSpots()}
                </LayerGroup>
              </Overlay>
              <Overlay checked name="Plans">
                <LayerGroup>
                  {this.drawPlans()}
                </LayerGroup>
              </Overlay>
              <Overlay checked name="Profiles">
                <LayerGroup>
                  {this.drawProfiles()}
                </LayerGroup>
              </Overlay>
              <Overlay checked name="AIS Data">
                <LayerGroup>
                  {this.drawAISData()}
                </LayerGroup>
              </Overlay>
            </LayersControl>
            <MeasureArea></MeasureArea>
          </Map>
        </div>
        <Slider onChange={this.onSliderChange} min={-12} max={12} value={this.state.sliderValue}></Slider>
        <NotificationSystem ref="notificationSystem" />
      </div>

    )
  }
}