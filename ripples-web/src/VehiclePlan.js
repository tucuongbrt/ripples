import React, { Component } from 'react'
import { Marker, Popup, Polyline } from 'react-leaflet'
import { WaypointIcon, GhostIcon } from './icons/Icons'
import { timeFromNow } from './DateUtils';
import { getSystemPosition } from './PositionUtils';

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
export default class VehiclePlan extends Component {

    constructor(props) {
        super(props);
        this.state = {
            etas: [],
            estimatedPos: { longitude: 0, latitude: 0 }
        }
        this.renderPlanLine = this.renderPlanLines.bind(this);
        this.renderPlanWaypoints = this.renderPlanWaypoints.bind(this);
        this.renderEstimatedPosition = this.renderEstimatedPosition.bind(this);
        this.updateETA = this.updateETA.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
    }

    componentDidMount() {
        this.updateETA();
        this.updateEstimatedPos();
        const interval1 = setInterval(this.updateETA, 1000);
        const interval2 = setInterval(this.updateEstimatedPos, 1000);
        // store interval in the state so it can be accessed later:
        this.setState({ interval1: interval1 });
        this.setState({ interval2: interval2 });
    }

    componentWillUnmount() {
        clearInterval(this.state.interval1);
        clearInterval(this.state.interval2);
    }


    /**
     * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
     * @param {} positions Positions of waypoints
     */
    renderPlanLines() {
        let positions = this.props.plan.waypoints.map(wp => [wp.latitude, wp.longitude])
        let polylines = [];
        for(let i = 0; i < positions.length - 1; i++){
            let current = positions[i];
            let next = positions[i+1];
            polylines.push(
                <Polyline key={"Polyline_" + i + "_" + this.props.plan.id} positions={[current,next]} color='#008000'></Polyline>
            )
        }
        return polylines;
    }

    renderPlanWaypoints() {
        let positions = this.props.plan.waypoints.map(wp => [wp.latitude, wp.longitude])
        let markers = [];
        positions.forEach((p, i) => {
            let isMovable = this.props.isMovable && (this.state.etas[i] - Date.now()) > 0;
            let popup = isMovable ? <Popup><span>Click on the map to move me there</span></Popup> : 
            (<Popup><h3>Waypoint {i} of {this.props.plan.id}</h3><span>ETA: {timeFromNow(this.state.etas[i])}</span></Popup>)
            markers.push(
                <Marker
                    key={"Waypoint" + i + "_" + this.props.plan.id}
                    index={i}
                    position={p}
                    icon={new WaypointIcon()}
                    onClick={() => this.props.handleMarkerClick(this.props.plan.id, i)}>
                    {popup}
                </Marker>
            )
        })
        return markers;
    }

    updateEstimatedPos() {
        const waypoints = this.props.plan.waypoints;
        const firstWaypoint = waypoints[0];
        const lastWaypoint = waypoints[waypoints.length - 1];
        const deltaTime = lastWaypoint.eta - firstWaypoint.eta;
        const timeSince = Date.now() - firstWaypoint.eta;
        const newEstimatedPosition = {
            latitude: firstWaypoint.latitude + (lastWaypoint.latitude - firstWaypoint.latitude) * (timeSince / deltaTime),
            longitude: firstWaypoint.longitude + (lastWaypoint.longitude - firstWaypoint.longitude) * (timeSince / deltaTime)
        }
        this.setState({ estimatedPos: newEstimatedPosition })
    }

    renderEstimatedPosition() {
        const estimatedPos = getSystemPosition(this.state.estimatedPos);
        return (
            <Marker key={"estimated_"+this.props.vehicle.imcid} position={estimatedPos} icon={new GhostIcon()} opacity={0.7}>
                <Popup>
                    <h3>Estimated Position</h3>
                    <ul>
                        <li>Lat: {estimatedPos.lat.toFixed(5)}</li>
                        <li>Lng: {estimatedPos.lng.toFixed(5)}</li>
                    </ul>
                </Popup>
            </Marker>
        )
    }

    updateETA() {
        let eta = [];
        this.props.plan.waypoints.forEach(wp => {
            eta.push(wp.eta*1000); //convert to ms
        })
        this.setState({ etas: eta })
    }

    render() {
        return (
            <div>
                {this.renderPlanLines()}
                {this.renderPlanWaypoints()}
                {this.renderEstimatedPosition()}
            </div>

        );
    }
}