import React, { Component } from 'react'
import {Marker, Popup, Polyline} from 'react-leaflet'
import {WaypointIcon, GhostIcon} from './icons/Icons'
import { secondsToTime } from './DateUtils';
import { getSystemPosition } from './PositionUtils';

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
export default  class VehiclePlan extends Component {

    constructor(props){
        super(props);
        let newWaypoints = props.waypoints.map(wp => {
            return {latitude: wp.latitude,
            longitude: wp.longitude,
            eta: wp.eta * 1000}
        })
        console.log(newWaypoints)
        this.state = {
            waypoints: newWaypoints,
            id: props.id,
            timeLeftToWp: [],
            estimatedPos: {longitude: 0, latitude: 0}
        }
        this.renderPlanLine = this.renderPlanLine.bind(this);
        this.renderPlanWaypoints = this.renderPlanWaypoints.bind(this);
        this.renderEstimatedPosition = this.renderEstimatedPosition.bind(this);
        this.updateTimeLeft = this.updateTimeLeft.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
    }

    componentDidMount() {
        this.updateTimeLeft();
        this.updateEstimatedPos();
        const interval1 = setInterval(this.updateTimeLeft, 1000);
        const interval2 = setInterval(this.updateEstimatedPos, 1000);
        // store interval in the state so it can be accessed later:
        this.setState({interval1: interval1});
        this.setState({interval2: interval2});
     }
     
     componentWillUnmount() {
        clearInterval(this.state.interval1);
        clearInterval(this.state.interval2);
     }
     

    renderPlanLine(positions){
        return <Polyline key={"Polyline" + this.state.id} positions={positions} color='#008000'></Polyline>
    }

    renderPlanWaypoints(positions){
        let markers = [];
        positions.forEach((p,i) => {
            markers.push(
            <Marker key={"Waypoint" + i + "_" + this.state.id} position={p} icon={new WaypointIcon()}>
                <Popup>
                    <h3>Waypoint</h3>
                    <span>ETA: {this.state.timeLeftToWp[i]}</span>
                </Popup>
            </Marker>
            )
        })
        return markers;
    }

    updateEstimatedPos(){
        const waypoints = this.state.waypoints;
        const firstWaypoint = waypoints[0];
        const lastWaypoint = waypoints[waypoints.length - 1];
        const deltaTime = lastWaypoint.eta - firstWaypoint.eta;
        const timeSince = Date.now() - firstWaypoint.eta;
        const newEstimatedPosition = {
            latitude: firstWaypoint.latitude + (lastWaypoint.latitude - firstWaypoint.latitude)* (timeSince/deltaTime),
            longitude: firstWaypoint.longitude + (lastWaypoint.longitude - firstWaypoint.longitude) * (timeSince/deltaTime)
        }
        this.setState({estimatedPos: newEstimatedPosition})
    }

    renderEstimatedPosition(){
        const estimatedPos = getSystemPosition(this.state.estimatedPos);
        return (
            <Marker key={this.props.imcid} position={estimatedPos} icon={new GhostIcon()} opacity={0.5}></Marker>
        )
    }

    updateTimeLeft(){
        let now = Date.now();
        let newTimeLeft = [];
        this.state.waypoints.forEach(wp => {
            newTimeLeft.push(secondsToTime(Math.floor((wp.eta - now)/1000)));
        })
        this.setState({timeLeftToWp: newTimeLeft})
    }

    render(){
        let positions = this.state.waypoints.map(wp => [wp.latitude, wp.longitude])
        return (
            <div>
                {this.renderPlanLine(positions)}
                {this.renderPlanWaypoints(positions)}
                {this.renderEstimatedPosition()}
            </div>
            
        );
    }
}