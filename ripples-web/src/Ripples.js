import React, { Component } from 'react'
import { Map, TileLayer, LayerGroup, LayersControl } from 'react-leaflet'
//import {auvIcon} from './icons/auvIcon'
import Vehicle from './Vehicle'
import Spot from './Spot'
import VehiclePlan from './VehiclePlan'
import { fetchSoiData, fetchProfileData } from './SoiUtils'
import './css/Ripples.css'
import VerticalProfile from './VerticalProfile';
const { BaseLayer, Overlay } = LayersControl

export default class Ripples extends Component {

  constructor(props) {
    super(props);
    this.state = {
      vehicles: [],
      spots: [],
      profiles: []
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
    this.state.vehicles.filter(vehicle => vehicle.plan.waypoints.length > 0).forEach(vehicle => {
      const plan = vehicle.plan;
      plans.push(
        <VehiclePlan key={"VehiclePlan" + plan.id} id={plan.id} waypoints={plan.waypoints}></VehiclePlan>
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
    this.state.profiles.forEach(profile => {
      profiles.push(
        <VerticalProfile data={profile}></VerticalProfile>
      )
    })
    return profiles;
  }

  render() {
    const position = [this.initCoords.lat, this.initCoords.lng]
    return (
      <Map center={position} zoom={this.initCoords.zoom}>
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
    )
  }
}