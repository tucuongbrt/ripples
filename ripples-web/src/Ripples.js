import React, { Component } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl } from 'react-leaflet'
import Freedraw, { ALL, EDIT, DELETE, NONE } from 'react-leaflet-freedraw';
import Vehicle from './Vehicle'
import Spot from './Spot'
import VehiclePlan from './VehiclePlan'
import { fetchSoiData, fetchProfileData, postNewPlan } from './utils/SoiUtils'
import './css/Ripples.css'
import VerticalProfile from './VerticalProfile';
import TopNav from './TopNav';
import 'react-leaflet-fullscreen-control'
import AISShip from './AISShip';
import { fetchAisData } from './utils/AISUtils';
import { distanceInKmBetweenCoords } from './utils/PositionUtils';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const { BaseLayer, Overlay } = LayersControl

export default class Ripples extends Component {

  constructor(props) {
    super(props);
    this.state = {
      plans: [],
      vehicles: [],
      previousVehicles: [],
      spots: [],
      profiles: [],
      aisShips: [],
      freeDrawMode: NONE,
      selectedPlan: null,
      freeDrawPolygon: [],
      dropdownText: 'Edit Plan',
      sidebarOpen: true,
      soiInterval: false,
    }
    this.initCoords = {
      lat: 41.18,
      lng: -8.7,
      zoom: 10,
    }

    this.drawVehicles = this.drawVehicles.bind(this)
    this.drawSpots = this.drawSpots.bind(this)
    this.drawPlans = this.drawPlans.bind(this)
    this.drawProfiles = this.drawProfiles.bind(this)
    this.updateSoiData = this.updateSoiData.bind(this)
    this.updateAISData = this.updateAISData.bind(this)
    this.handleExecPlan = this.handleExecPlan.bind(this)
    this.handleDrawNewPlan = this.handleDrawNewPlan.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.sendPlanToVehicle = this.sendPlanToVehicle.bind(this)
    this.cancelEditing = this.cancelEditing.bind(this);
    this.createNotification = this.createNotification.bind(this)
    this.handleDeleteMarker = this.handleDeleteMarker.bind(this)
    this.stopSoiUpdates = this.stopSoiUpdates.bind(this);
    this.startSoiUpdates = this.startSoiUpdates.bind(this);
  }

  componentDidMount() {
    this.updateSoiData();
    this.updateAISData();
    this.startSoiUpdates();
    const aisInterval = setInterval(this.updateAISData, 60000); //get ais data every minute
    this.setState({ aisInterval: aisInterval })
  }

  stopSoiUpdates() {
    clearInterval(this.state.soiInterval);
    this.setState({ soiInterval: false });
  }

  startSoiUpdates() {
    if (!this.state.soiInterval) {
      const soiInterval = setInterval(this.updateSoiData, 60000);
      this.setState({ soiInterval: soiInterval });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.soiInterval);
    clearInterval(this.state.aisInterval)
  }

  updateSoiData() {
    fetchSoiData()
      .then(soiData => {
        let vehicles = soiData.vehicles;
        vehicles = vehicles.map(v => {
          let plan = v.plan;
          plan.waypoints = plan.waypoints.map(wp => Object.assign(wp, { eta: wp.eta * 1000 }))
          return Object.assign(v, { plan: plan })
        })
        this.setState({ vehicles: vehicles, spots: soiData.spots })
        this.setState({ plans: soiData.vehicles.filter(v => v.plan.waypoints.length > 0).map(v => v.plan.id) })
      })
      .catch(error => {
        this.createNotification('error', "Failed to fetch soi data");
      })
    fetchProfileData().then(profiles => {
      this.setState({ profiles: profiles.filter(p => p.samples.length > 0) })
    }).catch(error => {
      this.createNotification('error', "Failed to fetch profiles data");
    })
  }
  updateAISData() {
    fetchAisData().then(shipsData => {
      console.log('Fetched aisShips', shipsData);
      let ships = shipsData.map(ship => Object.assign(ship, { type: Number(ship.type) }))
      this.setState({ aisShips: ships })
    })
  }

  drawVehicles() {
    let vehicles = [];
    this.state.vehicles.forEach(vehicle => {
      vehicles.push(
        <Vehicle key={vehicle.imcid} lastState={vehicle.lastState} name={vehicle.name}></Vehicle>
      )
    })
    return vehicles;
  }

  drawPlans() {
    let plans = [];
    let selectedPlan = this.state.selectedPlan;
    this.state.vehicles.filter(vehicle => vehicle.plan.waypoints.length > 0).forEach(vehicle => {
      const plan = vehicle.plan;
      plans.push(
        <VehiclePlan
          key={"VehiclePlan" + plan.id}
          plan={plan}
          vehicle={vehicle.name}
          imcId={vehicle.imcId}
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
    let spots = [];
    this.state.spots.forEach(spot => {
      spots.push(
        <Spot key={spot.imcid} lastState={spot.lastState} name={spot.name}></Spot>
      )
    })
    return spots;
  }

  drawProfiles() {
    let profiles = [];
    this.state.profiles.forEach((profile, i) => {
      profiles.push(
        <VerticalProfile key={"profile" + i} data={profile}></VerticalProfile>
      )
    })
    return profiles;
  }

  drawAISData() {
    let ships = [];
    this.state.aisShips.forEach(ship => {
      ships.push(
        <AISShip key={"Ship_" + ship.mmsi} data={ship}></AISShip>
      )
    })
    return ships;
  }

  handleOnMarkers = event => {
    this.setState({ freeDrawPolygon: event.latLngs[0] })
    this.setState({ freeDrawMode: EDIT | DELETE })
  };

  handleModeChange = event => {
    console.log(event)
  }

  handleDrawNewPlan = event => {
    console.log('new plan clicked', event);
    this.setState({
      freeDrawMode: ALL,
    })
  }

  handleExecPlan = event => {
    console.log('Execute plan', event);
    this.setState({
      freeDrawMode: NONE,
    })
  }

  handleEditPlan = (planId) => {
    console.log('Update plan: ', planId);
    // enable drag on markers of the plan
    this.setState({
      selectedPlan: planId,
      dropdownText: `Editing ${planId}`,
      previousVehicles: JSON.parse(JSON.stringify(this.state.vehicles)),
    })
    this.stopSoiUpdates();
  }

  handleMarkerClick(planId, markerId, isMovable) {

    if (isMovable && planId === this.state.selectedPlan) {
      this.setState({
        wpSelected: markerId,
      })
    }
  }

  handleDeleteMarker(planId, markerIdx) {
    const selectedPlan = this.state.selectedPlan;
    if (planId === selectedPlan) {
      let vehicles = this.state.vehicles.slice();
      const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
      vehicles[vehicleIdx].plan.waypoints.splice(markerIdx, 1);
      this.setState({ vehicles: vehicles });
    }
  }

  handleMapClick(e) {
    const selectedPlan = this.state.selectedPlan;
    const wpSelected = this.state.wpSelected;
    if (wpSelected != null && selectedPlan != null) {
      const newLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      this.setState({ wpSelected: null })
      // update waypoints locally
      let vehicles = this.state.vehicles.slice();
      const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
      vehicles[vehicleIdx].plan.waypoints[wpSelected] = Object.assign({}, newLocation, { eta: 0, duration: 60 })
      this.updateWaypointsEtaFromIndex(vehicles[vehicleIdx].plan.waypoints, wpSelected);
      this.setState({ vehicles: vehicles })
    }
  }

  updateWaypointsEtaFromIndex(waypoints, firstIndex) {
    if (firstIndex <= 0) {
      console.log("First Index cannot be lower than 1");
      return;
    }
    const speed = 3; // meters per second
    const lastIndex = waypoints.length - 1;
    for (let i = firstIndex; i <= lastIndex; i++) {
      let prevWp = waypoints[i - 1];
      let currentWp = waypoints[i];
      const distanceInMeters = distanceInKmBetweenCoords(prevWp.latitude, prevWp.longitude, currentWp.latitude, currentWp.longitude) * 1000;
      currentWp.eta = prevWp.eta + (distanceInMeters / speed) * 1000; // eta is saved in ms
    }

  }

  sendPlanToVehicle() {
    const selectedPlan = this.state.selectedPlan;
    const vehicles = this.state.vehicles;
    const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
    let plan = JSON.parse(JSON.stringify(vehicles[vehicleIdx].plan));
    // convert eta from ms
    plan.waypoints = plan.waypoints.map(wp => Object.assign(wp, { eta: wp.eta / 1000 }))
    if (vehicleIdx >= 0) {
      postNewPlan(vehicles[vehicleIdx].name, plan)
        .then(([responseOk, body]) => {
          this.createNotification(body.status, body.message)
          if (!responseOk) {
            this.cancelEditing();
          } else {
            this.startSoiUpdates();
          }
        })
        .catch(error => {
          // handles fetch errors
          this.createNotification('error', error.message);
          this.cancelEditing();
        });
    }
    this.setState({ selectedPlan: null, dropdownText: `Edit Plan` })
  }

  cancelEditing() {
    const prevVehicles = JSON.parse(JSON.stringify(this.state.previousVehicles))
    this.startSoiUpdates();
    this.setState({
      vehicles: prevVehicles,
      prevVehicles: null,
      selectedPlan: null,
      dropdownText: `Edit Plan`
    });
  }

  createNotification(type, message) {
    switch (type) {
      case 'info':
        NotificationManager.info(message);
        break;
      case 'success':
        NotificationManager.success(message);
        break;
      case 'warning':
        NotificationManager.warning(message);
        break;
      case 'error':
        NotificationManager.error(message);
        break;
      default:
        NotificationManager.info(message);
        break;
    }
  }


  freedrawRef = React.createRef();

  render() {
    const position = [this.initCoords.lat, this.initCoords.lng]
    const mode = this.state.freeDrawMode;
    console.log("Draw mode", mode)
    return (
      <div>
        <div className="navbar">
          <TopNav
            plans={this.state.plans}
            handleDrawNewPlan={this.handleDrawNewPlan}
            handleExecPlan={this.handleExecPlan}
            handleEditPlan={this.handleEditPlan}
            sendPlanToVehicle={this.sendPlanToVehicle}
            cancelEditing={this.cancelEditing}
            dropdownText={this.state.dropdownText}>
          </TopNav>
        </div>
        <div className="map">
          <Map fullscreenControl center={position} zoom={this.initCoords.zoom} onClick={this.handleMapClick}>
            <Freedraw
              mode={mode}
              onMarkers={this.handleOnMarkers}
              onModeChange={this.handleModeChange}
              ref={this.freedrawRef}
              maximumPolygons={1}
            />
            <LayersControl position="topright">
              <BaseLayer checked name="OpenStreetMap.Mapnik">
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
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

          </Map>
        </div>
        <NotificationContainer />
      </div>

    )
  }
}