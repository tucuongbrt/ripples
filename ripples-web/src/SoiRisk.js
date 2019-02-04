import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { fetchSoiData } from './SoiUtils';
import { timeFromNow } from './DateUtils';
import { distanceInKmBetweenCoords } from './PositionUtils';

export default class SoiRisk extends Component {

    constructor(props){
        super(props);
        this.state = {
            vehicles: []
        }
        this.rootCoords = {lat: 41.18, lng: -8.7}
        this.updateSoiData = this.updateSoiData.bind(this)
        this.renderAllVehicles = this.renderAllVehicles.bind(this)
    }

    componentDidMount() {
        this.updateSoiData();
        const intervalId = setInterval(this.updateSoiData, 60000); //get Soi data every minute
        this.setState({intervalId: intervalId})
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    updateSoiData(){
        fetchSoiData().then(soiData => {
            this.setState({vehicles: soiData.vehicles})
        })
    }

    getNextWaypoint(vehicle){
        const waypoints = vehicle.plan.waypoints;
        const lastLat = vehicle.lastState.latitude;
        const isLatIncreasing = waypoints[0].latitude < waypoints[1].latitude;
        if(isLatIncreasing) {
            return waypoints.find((e,i) => {
                if (i!==0){
                    return e.latitude > lastLat && waypoints[i-1].latitude < lastLat
                }
                return false;
            })
        } else {
            return waypoints.find((e,i) => {
                if (i !== 0) {
                    return e.latitude < lastLat && waypoints[i-1].latitude > lastLat
                }
                return false;
            })
        }
    }

    getDistanceToVehicle(vehicle){
        return distanceInKmBetweenCoords(
            vehicle.lastState.latitude,
            vehicle.lastState.longitude,
            this.rootCoords.lat,
            this.rootCoords.lng).toFixed(3)
    }

    renderVehicle(vehicle){
        const nextWaypoint= this.getNextWaypoint(vehicle);
        return (
            <tr key={vehicle.name}>
                <th scope="row">{vehicle.name}</th>
                <td>{timeFromNow(vehicle.lastState.timestamp*1000)}</td>
                <td>{timeFromNow(nextWaypoint.eta * 1000)}</td>
                <td>{vehicle.lastState.fuel}</td>
                <td>{this.getDistanceToVehicle(vehicle)}</td>
                <td>N/D</td>
                <td>N/D</td>
            </tr>
        )
    }

    renderAllVehicles(){
        return this.state.vehicles.map(vehicle => this.renderVehicle(vehicle))
    }

    render(){
        return (
                <Table responsive>
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
                  <tbody>
                    {this.renderAllVehicles()}
                  </tbody>
                </Table>
        )
    }
}