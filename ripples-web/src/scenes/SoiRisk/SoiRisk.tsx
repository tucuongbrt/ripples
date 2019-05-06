import React, { Component } from 'react';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { fetchSoiData, fetchCollisions } from '../../services/SoiUtils';
import { timeFromNow, timestampMsToReadableDate } from '../../services/DateUtils';
import { distanceInKmBetweenCoords } from '../../services/PositionUtils';
import IAsset from '../../model/IAsset';
import ILatLng from '../../model/ILatLng';
import IPositionAtTime from '../../model/IPositionAtTime';
import { IPotentialCollision } from '../../model/IPotentialCollision';
import './styles/SoiRisk.css';
import IPlan from '../../model/IPlan';


type stateType = {
    vehicles: IAsset[],
    plans: IPlan[],
    collisions: IPotentialCollision[],
    collisionsModal: boolean
}

export default class SoiRisk extends Component<{}, stateType> {

    timerID: number = 0
    rootCoords: ILatLng = { latitude: 41.18, longitude: -8.7 }

    constructor(props: any) {
        super(props);
        this.state = {
            vehicles: [],
            plans: [],
            collisions: [],
            collisionsModal: false
        }
        this.updateSoiData = this.updateSoiData.bind(this)
        this.buildAllVehicles = this.buildAllVehicles.bind(this)
        this.buildVehicleCollisions = this.buildVehicleCollisions.bind(this)
        this.toggleCollisionsModal = this.toggleCollisionsModal.bind(this)
    }

    componentDidMount() {
        this.updateSoiData();
        this.timerID = window.setInterval(this.updateSoiData, 60000); //get Soi data every minute
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    async updateSoiData() {
        const soiData = await fetchSoiData()
        const collisions = await fetchCollisions()
        this.setState({
            vehicles: soiData.vehicles,
            plans: soiData.plans,
            collisions: collisions
        })
    }

    getNextWaypointIdx(vehicle: IAsset, plan: IPlan) {
        const waypoints = plan.waypoints;
        if (waypoints.length == 0) return -1;
        const lastCommTimestamp = vehicle.lastState.timestamp;
        const timeIntervals = waypoints.map(wp => Math.abs(wp.timestamp - lastCommTimestamp))
        const minInterval = Math.min(...timeIntervals)
        const minIntervalIdx = timeIntervals.findIndex(d => d == minInterval);
        const minIntervalWP = waypoints[minIntervalIdx];
        // distance in meters
        const distanceToMinInterval = distanceInKmBetweenCoords(minIntervalWP, vehicle.lastState) * 1000;
        // if distance is less than 100m, let's consider that the vehicle already arrived to that waypoint
        if (distanceToMinInterval < 100)
            return waypoints.length > minIntervalIdx + 1 ? minIntervalIdx + 1 : minIntervalIdx;
        return minIntervalIdx
    }

    getDistanceToVehicle(vehicle: IAsset): string {
        return distanceInKmBetweenCoords(
            vehicle.lastState,
            this.rootCoords).toFixed(3)
    }

    buildTimeForNextWaypoint(waypoints: IPositionAtTime[], nextWaypointIdx: number) {
        if (nextWaypointIdx >= 0 && nextWaypointIdx < waypoints.length) {
            return <td className="bg-green">{timeFromNow(waypoints[nextWaypointIdx].timestamp)}</td>
        }
        return <td className="bg-red">N/D</td>

    }

    buildLastCommunication(timestamp: number) {
        const greenTreshold = 15 * 60 * 1000;
        const orangeTreshold = 30 * 60 * 1000;
        const deltaTime = Date.now() - timestamp;
        return <td
            className={deltaTime < greenTreshold ? 'bg-green' : deltaTime < orangeTreshold ? 'bg-orange' : 'bg-red'}>
            {timeFromNow(timestamp)}
        </td>
    }

    buildFuel(fuel: number) {
        return <td className={fuel > 0.5 ? 'bg-green' : fuel > 0.1 ? 'bg-orange' : 'bg-red'}>{fuel}</td>
    }

    buildVehicle(vehicle: IAsset) {
        const vehiclePlan: IPlan|undefined = this.state.plans.find(p => p.id == vehicle.planId)
        if (vehiclePlan == undefined) return
        const nextWaypointIdx = this.getNextWaypointIdx(vehicle, vehiclePlan);
        console.log("next wp index: ", nextWaypointIdx)
        return (
            <tr key={vehicle.name}>
                <th scope="row">{vehicle.name}</th>
                {this.buildLastCommunication(vehicle.lastState.timestamp)}
                {this.buildTimeForNextWaypoint(vehiclePlan.waypoints, nextWaypointIdx)}
                {this.buildFuel(vehicle.lastState.fuel)}
                <td>{this.getDistanceToVehicle(vehicle)}</td>
                {this.buildVehicleCollisions(vehicle.name)}
                <td>N/D</td>
            </tr>
        )
    }

    buildAllVehicles() {
        return this.state.vehicles.map(vehicle => this.buildVehicle(vehicle))
    }

    toggleCollisionsModal() {
        this.setState(prevState => ({
            collisionsModal: !prevState.collisionsModal
        }));
    }

    buildVehicleCollisions(assetName: string) {
        const allCollisions = this.state.collisions;
        const assetCollisions = allCollisions.filter(c => c.asset == assetName)
        assetCollisions.sort((a,b) => a.timestamp - b.timestamp);
        console.log("Asset collisions length", assetCollisions.length);
        return <td className={assetCollisions.length == 0 ? 'bg-green' : 'bg-red'}>
            <div>
                <Button onClick={this.toggleCollisionsModal}>{assetCollisions.length}</Button>
                <Modal isOpen={this.state.collisionsModal} toggle={this.toggleCollisionsModal}>
                    <ModalHeader toggle={this.toggleCollisionsModal}>{assetName} collisions</ModalHeader>
                    <ModalBody>
                        {assetCollisions.map((c: IPotentialCollision) => {
                            return (
                                <div>
                                    <ul>
                                        <li>Ship: {c.ship}</li>
                                        <li>Distance: {c.distance.toFixed(2)}m</li>
                                        <li>time: {timestampMsToReadableDate(c.timestamp)}</li>
                                    </ul>
                                    <hr></hr>
                                </div>
                            )
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggleCollisionsModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>

        </td>;
    }

    render() {
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
                    {this.buildAllVehicles()}
                </tbody>
            </Table>
        )
    }
}