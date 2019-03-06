import React, { Component } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl } from 'react-leaflet'
import Freedraw, { ALL, EDIT, DELETE, NONE } from 'react-leaflet-freedraw';
import Vehicle from './components/Vehicle'
import Spot from './components/Spot'
import VehiclePlan from './components/VehiclePlan'
import MeasureArea from './components/MeasureArea'
import { fetchSoiData, fetchProfileData, postNewPlan, fetchAwareness } from '../../services/SoiUtils'
import './styles/Ripples.css'
import VerticalProfile from './components/VerticalProfile';
import TopNav from './components/TopNav';
import Slider from './components/SliderControl';
import 'react-leaflet-fullscreen-control'
import AISShip from './components/AISShip';
import { fetchAisData } from '../../services/AISUtils';
import { distanceInKmBetweenCoords } from '../../services/PositionUtils';
import { NotificationContainer} from 'react-notifications';
import { createNotification } from '../../services/Notifications'
import 'react-notifications/lib/notifications.css';
import EstimatedPosition from './components/EstimatedPosition';
import Profile from '../../model/Profile';

const { BaseLayer, Overlay } = LayersControl

type MyState = { 
  plans: any[],
  vehicles: any[],
  previousVehicles: any[],
  spots: any[],
  profiles: any[],
  aisShips: any[],
  freeDrawMode: Number,
  selectedPlan: any,
  freeDrawPolygon: any[],
  dropdownText: String,
  sidebarOpen: Boolean,
  soiInterval: any,
  aisInterval: any,
  soiAwareness: any[],
  sliderValue: Number
 };

export default class Ripples extends Component<{}, MyState> {

  initCoords: any;

  constructor(props: any) {
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
      aisInterval: false,
      soiAwareness : [],
      sliderValue : 0,
    }

    this.initCoords = {
      lat: 41.18,
      lng: -8.7,
      zoom: 10,
    }

    this.cancelEditing = this.cancelEditing.bind(this)
    this.drawVehicles = this.drawVehicles.bind(this)
    this.drawSpots = this.drawSpots.bind(this)
    this.drawPlans = this.drawPlans.bind(this)
    this.drawProfiles = this.drawProfiles.bind(this)
    this.handleExecPlan = this.handleExecPlan.bind(this)
    this.handleDeleteMarker = this.handleDeleteMarker.bind(this)
    this.handleDrawNewPlan = this.handleDrawNewPlan.bind(this)
    this.handleEditPlan = this.handleEditPlan.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.onSliderChange = this.onSliderChange.bind(this)
    this.sendPlanToVehicle = this.sendPlanToVehicle.bind(this)
    this.stopUpdates = this.stopUpdates.bind(this)
    this.startUpdates = this.startUpdates.bind(this)
    this.updateSoiData = this.updateSoiData.bind(this)
    this.updateAISData = this.updateAISData.bind(this)
  }

  componentDidMount() {
    this.startUpdates();
  }

  stopUpdates() {
    clearInterval(this.state.soiInterval);
    this.setState({ soiInterval: false });
    clearInterval(this.state.aisInterval);
    this.setState({soiInterval: false});
  }

  startUpdates() {
    this.updateSoiData();
    this.updateAISData();
    if (!this.state.soiInterval) {
      const soiInterval = setInterval(this.updateSoiData, 60000);
      this.setState({ soiInterval: soiInterval });
    }
    if (!this.state.aisInterval) {
      const aisInterval = setInterval(this.updateAISData, 60000); //get ais data every minute
      this.setState({ aisInterval: aisInterval })
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.soiInterval);
    clearInterval(this.state.aisInterval)
  }

  updateSoiData() {
    fetchSoiData()
      .then(soiData => {
        this.setState({ vehicles: soiData.vehicles, spots: soiData.spots })
        this.setState({ plans: soiData.vehicles.filter(v => v.plan.waypoints.length > 0).map(v => [v.name, v.plan.id]) })
      })
      .catch(error => {
        createNotification('error', "Failed to fetch soi data");
      })
    fetchProfileData().then(profiles => {
      this.setState({ profiles: profiles.filter(p => p.samples.length > 0) })
    }).catch(error => {
      createNotification('error', "Failed to fetch profiles data");
    })
    fetchAwareness().then(assetsPositions => {
      this.setState({ soiAwareness: assetsPositions})
    }).catch(error => {
      createNotification('error', 'Failed to fetch awareness data');
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
    if (this.state.drawVehicleAwareness === true) {
      const deltaHours = this.state.sliderValue 
      this.state.soiAwareness.forEach(vehicle => {
        vehicles.push(
          <EstimatedPosition vehicle={vehicle.name} deltaHours={deltaHours} positions={vehicle.positions}></EstimatedPosition>
        )
      })
    }
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
    this.stopUpdates();
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
      this.updateWaypointsArrivalDateFromIndex(vehicles[vehicleIdx].plan.waypoints, markerIdx);
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
      this.updateWaypointsArrivalDateFromIndex(vehicles[vehicleIdx].plan.waypoints, wpSelected);
      this.setState({ vehicles: vehicles })
    }
  }

  getSpeedBetweenWaypoints(waypoints){
    if (waypoints.length < 2) return 1;
    let firstWp = waypoints[0];
    let secondWp = waypoints[1];
    const distanceInMeters = distanceInKmBetweenCoords(firstWp.latitude, firstWp.longitude, secondWp.latitude, secondWp.longitude) * 1000;
    const deltaSec = (secondWp.timestamp - firstWp.timestamp)/1000;
    return distanceInMeters/deltaSec;
  }

  updateWaypointsArrivalDateFromIndex(waypoints, firstIndex) {
    if (firstIndex <= 0 || firstIndex >= waypoints.length) {
      return;
    }
    const speed = this.getSpeedBetweenWaypoints(waypoints)
    const lastIndex = waypoints.length - 1;
    for (let i = firstIndex; i <= lastIndex; i++) {
      let prevWp = waypoints[i - 1];
      let currentWp = waypoints[i];
      const distanceInMeters = distanceInKmBetweenCoords(prevWp.latitude, prevWp.longitude, currentWp.latitude, currentWp.longitude) * 1000;
      currentWp.timestamp = prevWp.timestamp + Math.round(distanceInMeters / speed) * 1000; // timestamp is saved in ms
    }

  }

  sendPlanToVehicle() {
    const selectedPlan = this.state.selectedPlan;
    const vehicles = this.state.vehicles;
    const vehicleIdx = vehicles.findIndex(v => v.plan.id === selectedPlan);
    let plan = JSON.parse(JSON.stringify(vehicles[vehicleIdx].plan));
    plan.waypoints = plan.waypoints.map(wp => Object.assign(wp, { eta: wp.timestamp / 1000 }))
    if (vehicleIdx >= 0) {
      postNewPlan(vehicles[vehicleIdx].name, plan)
        .then(([responseOk, body]) => {
          createNotification(body.status, body.message)
          if (!responseOk) {
            this.cancelEditing();
          } else {
            this.startUpdates();
          }
        })
        .catch(error => {
          // handles fetch errors
          createNotification('error', error.message);
          this.cancelEditing();
        });
    }
    this.setState({ selectedPlan: null, dropdownText: `Edit Plan` })
  }

  cancelEditing() {
    const prevVehicles = JSON.parse(JSON.stringify(this.state.previousVehicles))
    this.startUpdates();
    this.setState({
      vehicles: prevVehicles,
      prevVehicles: null,
      selectedPlan: null,
      dropdownText: `Edit Plan`
    });
  }

  onSliderChange(event) {
    let sliderValue = event.target.value
    if (sliderValue === 0){
      // reset state
      this.startUpdates()
      this.setState({drawVehicleAwareness: false})
    } else {
      this.stopUpdates()
      this.setState({drawVehicleAwareness: true})
    }
    this.setState({sliderValue: sliderValue})
    console.log("Slider new value", sliderValue)
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
            <Slider onChange={this.onSliderChange} min={-12} max={12} value={0}></Slider>
          </Map>
        </div>
        <NotificationContainer />
      </div>

    )
  }
}