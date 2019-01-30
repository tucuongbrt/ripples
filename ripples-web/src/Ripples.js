import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup, Polyline} from 'react-leaflet'
import {auvIcon} from './icons/auvIcon'
import './css/Ripples.css'

export default class Ripples extends Component {

  constructor(props){
    super(props);
    this.state = {
      lat: 41.18,
      lng: -8.7,
      zoom: 5,
      soiData: [],
    }
    this.drawActiveSystems = this.drawActiveSystems.bind(this)
    this.drawPlans = this.drawPlans.bind(this)
  }

  componentDidMount() {

    fetch('http://localhost:9090/soi')
      .then(response => response.json())
      .then((data) => {
        console.log('soiData', data);
        this.setState({soiData: data})
      });
  }

  getSystemPosition(lastState){
    return {lat: lastState.latitude, lng: lastState.longitude}
  }
  timestampToDate(timestamp) {
    return new Date(timestamp).toISOString();
  }
  drawActiveSystems(){
    let markers = [];
    this.state.soiData.forEach(system => {
      markers.push(
        <Marker key={system.imcid} position={this.getSystemPosition(system.lastState)} icon={auvIcon}>
          <Popup>
            <h3>{system.name}</h3>
            <ul>
              <li>Fuel: {system.lastState.fuel}</li>
              <li>Heading: {system.lastState.heading}</li>
              <li>Date: {this.timestampToDate(system.lastState.timestamp)}</li>
            </ul>
          </Popup>
        </Marker>
      )
    })
    return markers;
  }
  drawPlans(){
    let plans = [];
    let soiData = this.state.soiData
    soiData.filter(s => s.plan.waypoints.length > 0).forEach(vehicle => {
      let waypoints = vehicle.plan.waypoints;
      let positions = waypoints.map(wp => [wp.latitude, wp.longitude])
      positions.forEach((p,i) => {
        plans.push(
          <Marker position={p}>
            <Popup>
              <h3>Waypoint</h3>
              <span>ETA: {this.timestampToDate(waypoints[i].eta)}</span>
            </Popup>
          </Marker>
        )
      })
      plans.push(
        <Polyline key={vehicle.plan.id} positions={positions} color='#008000'></Polyline>
      )
    })
    return plans;
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {this.drawActiveSystems()}
        {this.drawPlans()}
      </Map>
    )
  }
}