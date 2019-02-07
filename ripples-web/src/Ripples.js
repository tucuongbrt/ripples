import React, { Component } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl } from 'react-leaflet'
import Freedraw, { ALL, EDIT, DELETE, NONE } from 'react-leaflet-freedraw';
import Vehicle from './Vehicle'
import Spot from './Spot'
import VehiclePlan from './VehiclePlan'
import { fetchSoiData, fetchProfileData } from './utils/SoiUtils'
import './css/Ripples.css'
import VerticalProfile from './VerticalProfile';
import TopNav from './TopNav';
import 'react-leaflet-fullscreen-control'
import AISShip from './AISShip';
import { fetchAisData } from './utils/AISUtils';

const { BaseLayer, Overlay } = LayersControl

export default class Ripples extends Component {

  constructor(props) {
    super(props);
    this.state = {
      plans: [],
      vehicles: [],
      spots: [],
      profiles: [],
      aisShips: [],
      freeDrawMode: NONE,
      selectedPlan: null,
      freeDrawPolygon: [],
      dropdownText: 'Edit Plan',
      sidebarOpen: true
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
  }

  componentDidMount() {
    this.updateSoiData();
    this.updateAISData();
    const soiInterval = setInterval(this.updateSoiData, 60000); //get Soi data every minute
    const aisInterval = setInterval(this.updateAISData, 60000); //get Soi data every minute
    this.setState({ soiInterval: soiInterval, aisInterval: aisInterval })
  }

  componentWillUnmount() {
    clearInterval(this.state.soiInterval);
    clearInterval(this.state.aisInterval)
  }

  updateSoiData() {
    fetchSoiData().then(soiData => {
      let vehicles = soiData.vehicles;
      vehicles = vehicles.map(v => {
        let plan = v.plan;
        plan.waypoints = plan.waypoints.map(wp => Object.assign(wp, { eta: wp.eta * 1000 }))
        return Object.assign(v, { plan: plan })
      })
      this.setState({ vehicles: vehicles, spots: soiData.spots })
      this.setState({ plans: soiData.vehicles.filter(v => v.plan.waypoints.length > 0).map(v => v.plan.id) })
    })
    fetchProfileData().then(profiles => {
      this.setState({ profiles: profiles.filter(p => p.samples.length > 0) })
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
          handleMarkerClick={this.handleMarkerClick}>
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
      dropdownText: `Editing ${planId}`
    })
  }

  handleMarkerClick(planId, markerId) {
    console.log(planId, markerId)
    console.log(this.state.selectedPlan)
    if (planId === this.state.selectedPlan) {
      this.setState({
        wpSelected: markerId,
      })
    }
  }

  handleMapClick(e) {
    const selectedPlan = this.state.selectedPlan;
    const wpSelected = this.state.wpSelected;
    if (wpSelected != null && selectedPlan != null) {
      const newLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      this.setState({ wpSelected: null, selectedPlan: null, dropdownText: `Edit Plan` })
      // TODO: send new point to server
      console.log(e)
      // update point locally
      let newVehicles = this.state.vehicles.slice();
      const vehicleIdx = newVehicles.findIndex(v => v.plan.id === selectedPlan);
      const prevEta = newVehicles[vehicleIdx].plan.waypoints[wpSelected].eta;
      newVehicles[vehicleIdx].plan.waypoints[wpSelected] = Object.assign({}, newLocation, { eta: prevEta, duration: 120 })
      this.setState({ vehicles: newVehicles })
      console.log("Vehicles:", this.state.vehicles)
    }
  }


  freedrawRef = React.createRef();

  render() {
    const position = [this.initCoords.lat, this.initCoords.lng]
    const mode = this.state.freeDrawMode;
    console.log("Draw mode", mode)
    return (
      <div>
        <div class="navbar">
          <TopNav
            plans={this.state.plans}
            handleDrawNewPlan={this.handleDrawNewPlan}
            handleExecPlan={this.handleExecPlan}
            handleEditPlan={this.handleEditPlan}
            dropdownText={this.state.dropdownText}>
          </TopNav>
        </div>
        <div class="map"> 
          <Map center={position} zoom={this.initCoords.zoom} fullscreenControl onClick={this.handleMapClick}>
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
      </div>

    )
  }
}