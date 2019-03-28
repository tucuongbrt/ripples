import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { fetchSoiData } from '../../services/SoiUtils';
import { timeFromNow } from '../../services/DateUtils';
import { distanceInKmBetweenCoords } from '../../services/PositionUtils';
import IAsset from '../../model/IAsset';
import ILatLng from '../../model/ILatLng';
import IPositionAtTime from '../../model/IPositionAtTime';


type stateType = {
    vehicles: IAsset[],
}

export default class SoiRisk extends Component<{}, stateType> {

    timerID: number = 0
    rootCoords: ILatLng = {latitude: 41.18, longitude: -8.7}

    constructor(props: any){
        super(props);
        this.state = {
            vehicles: [],
        }
        this.updateSoiData = this.updateSoiData.bind(this)
        this.renderAllVehicles = this.renderAllVehicles.bind(this)
    }

    componentDidMount() {
        this.updateSoiData();
        this.timerID = window.setInterval(this.updateSoiData, 60000); //get Soi data every minute
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    updateSoiData(){
        fetchSoiData().then(soiData => {
            this.setState({vehicles: soiData.vehicles})
        })
    }

    getNextWaypoint(vehicle: IAsset){
        const waypoints = vehicle.plan.waypoints;
        const lastLat = vehicle.lastState.latitude;
        const isLatIncreasing = waypoints[0].latitude < waypoints[1].latitude;
        if(isLatIncreasing) {
            return waypoints.findIndex((e,i) => {
                return e.latitude > lastLat && waypoints[i-1].latitude < lastLat
                
            })
        } else {
            return waypoints.findIndex((e,i) => {
                return e.latitude < lastLat && waypoints[i-1].latitude > lastLat
            })
        }
    }

    getDistanceToVehicle(vehicle: IAsset){
        return distanceInKmBetweenCoords(
            vehicle.lastState,
            this.rootCoords).toFixed(3)
    }

    renderTimeForNextWaypoint(waypoints: IPositionAtTime[], nextWaypointIdx: number){
        if (nextWaypointIdx >= 0){
            return <td>{timeFromNow(waypoints[nextWaypointIdx].timestamp)}</td> 
        }
        return <td>N/D</td>
        
    }

    renderVehicle(vehicle: IAsset){
        const nextWaypointIdx = this.getNextWaypoint(vehicle);
        return (
            <tr key={vehicle.name}>
                <th scope="row">{vehicle.name}</th>
                <td>{timeFromNow(vehicle.lastState.timestamp)}</td>
                {this.renderTimeForNextWaypoint(vehicle.plan.waypoints, nextWaypointIdx)}
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