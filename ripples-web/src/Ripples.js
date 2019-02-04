import React, { Component } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl} from 'react-leaflet'
import { Container, Row, Col } from 'reactstrap';
import Freedraw, { ALL, EDIT, DELETE, NONE } from 'react-leaflet-freedraw';
import Vehicle from './Vehicle'
import Spot from './Spot'
import VehiclePlan from './VehiclePlan'
import { fetchSoiData, fetchProfileData } from './SoiUtils'
import './css/Ripples.css'
import VerticalProfile from './VerticalProfile';
import LeftsideNav from './LeftsideNav';
import 'react-leaflet-fullscreen-control'

const { BaseLayer, Overlay } = LayersControl

export default class Ripples extends Component {

  constructor(props) {
    super(props);
    this.state = {
      plans: [],
      vehicles: [],
      spots: [],
      profiles: [],
      freeDrawMode: NONE,
      selecetdPlan: null,
      freeDrawPolygon: [],
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
    this.handleExecPlan = this.handleExecPlan.bind(this)
    this.handleDrawNewPlan = this.handleDrawNewPlan.bind(this)
    this.handleUpdatePlan = this.handleUpdatePlan.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
  }

  componentDidMount() {
    this.updateSoiData();
    const intervalId = setInterval(this.updateSoiData, 60000); //get Soi data every minute
    this.setState({ intervalId: intervalId })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateSoiData() {
    fetchSoiData().then(soiData => {
      this.setState({ vehicles: soiData.vehicles, spots: soiData.spots })
      this.setState({ plans: soiData.vehicles.filter(v => v.plan.waypoints.length > 0).map(v => v.plan.id) })
    })
    fetchProfileData().then(profiles => {
      this.setState({ profiles: profiles.filter(p => p.samples.length > 0) })
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
        id={plan.id}
        waypoints={plan.waypoints} isMovable={plan.id === selectedPlan}
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

  handleOnMarkers = event => {
    this.setState({ freeDrawPolygon: event.latLngs[0] })
    this.setState({freeDrawMode: EDIT | DELETE})
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

  handleUpdatePlan = (planId) => {
    console.log('Update plan: ', planId);
    // enable drag on markers of the plan
    this.setState({
      selectedPlan: planId
    })
  }

  handleMarkerClick(planId, markerId){
    console.log(planId, markerId)
    if(planId === this.state.selecetdPlan){
        this.setState({
            wpSelected: markerId
        })
    }
    
}


  freedrawRef = React.createRef();

  render() {
    const position = [this.initCoords.lat, this.initCoords.lng]
    const mode = this.state.freeDrawMode;
    console.log("Draw mode", mode)
    return (
      <Container fluid={true}>
        <Row>
          <Col xs="2">
            <LeftsideNav
              plans={this.state.plans}
              handleDrawNewPlan={this.handleDrawNewPlan}
              handleExecPlan={this.handleExecPlan}
              handleUpdatePlan={this.handleUpdatePlan}>
            </LeftsideNav>
          </Col>
          <Col xs="10">
            <Map center={position} zoom={this.initCoords.zoom} fullscreenControl>
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
              </LayersControl>

            </Map>
          </Col>
        </Row>
      </Container>

    )
  }
}