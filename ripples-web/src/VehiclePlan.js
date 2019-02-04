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
        let newWaypoints = props.waypoints.map(wp => {
            return {
                latitude: wp.latitude,
                longitude: wp.longitude,
                eta: wp.eta * 1000 // save in millisseconds
            }
        })
        console.log(newWaypoints)
        this.state = {
            prevWaypoits: newWaypoints, //save state in order to cancel plan changes
            waypoints: newWaypoints,
            id: props.id,
            etas: [],
            estimatedPos: { longitude: 0, latitude: 0 }
        }
        this.renderPlanLine = this.renderPlanLine.bind(this);
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


    renderPlanLine(positions) {
        return <Polyline key={"Polyline" + this.state.id} positions={positions} color='#008000'></Polyline>
    }

    renderPlanWaypoints(positions) {
        let markers = [];
        positions.forEach((p, i) => {
            let isMovable = this.props.isMovable && (this.state.etas[i] - Date.now()) > 0;
            let popup = isMovable ? <Popup><span>Click on the map to move me there</span></Popup> : 
            (<Popup><h3>Waypoint</h3><span>ETA: {timeFromNow(this.state.etas[i])}</span></Popup>)
            markers.push(
                <Marker
                    key={"Waypoint" + i + "_" + this.state.id}
                    index={i}
                    position={p}
                    icon={new WaypointIcon()}
                    onClick={() => this.props.handleMarkerClick(this.state.id, i)}>
                    {popup}
                </Marker>
            )
        })
        return markers;
    }

    updateEstimatedPos() {
        const waypoints = this.state.waypoints;
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
            <Marker key={this.props.imcid} position={estimatedPos} icon={new GhostIcon()} opacity={0.7}>
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
        this.state.waypoints.forEach(wp => {
            eta.push(wp.eta);
        })
        this.setState({ etas: eta })
    }

    render() {
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