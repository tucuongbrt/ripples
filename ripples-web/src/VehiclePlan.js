import React, { Component } from 'react'
import { Marker, Popup, Polyline } from 'react-leaflet'
import { WaypointIcon, GhostIcon } from './icons/Icons'
import { timeFromNow } from './utils/DateUtils';
import { getSystemPosition } from './utils/PositionUtils';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
export default class VehiclePlan extends Component {

    constructor(props) {
        super(props);
        this.state = {
            estimatedPos: { longitude: 0, latitude: 0 }
        }
        this.renderPlanLine = this.renderPlanLines.bind(this);
        this.renderPlanWaypoints = this.renderPlanWaypoints.bind(this);
        this.renderEstimatedPosition = this.renderEstimatedPosition.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
        this.getPrevAndNextWaypoints = this.getPrevAndNextWaypoints.bind(this)
    }

    componentDidMount() {
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
        const waypoints = this.props.plan.waypoints;
        const positions = waypoints.map(wp => [wp.latitude, wp.longitude])
        let markers = [];
        const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
          });
      
      
        positions.forEach((p, i) => {
            let eta = waypoints[i].eta;
            let isMovable = this.props.isMovable && (eta - Date.now()) > 0;
            let className = (this.props.wpSelected === i && isMovable) ? 'editing-waypoint' : '';
            const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon();
            let popup = isMovable ? <Popup>
            Click anywhere on the map to move me'
            <button onClick={() => this.props.handleDeleteMarker(this.props.plan.id, i)}>Delete me</button>
            </Popup> : 
            (<Popup><h3>Waypoint {i} of {this.props.plan.id}</h3><span>ETA: {timeFromNow(eta)}</span></Popup>)
            markers.push(
                <Marker
                    key={"Waypoint" + i + "_" + this.props.plan.id}
                    index={i}
                    position={p}
                    icon={icon}
                    onClick={() => this.props.handleMarkerClick(this.props.plan.id, i, isMovable)}
                    className={className}>
                    {popup}
                </Marker>
            )
        })
        return markers;
    }

    getPrevAndNextWaypoints(now){
        const waypoints = this.props.plan.waypoints;
        const prevIndex = waypoints.findIndex((wp,i) => wp.eta < now && waypoints[i+1].eta > now)
        return {prev: waypoints[prevIndex], next: waypoints[prevIndex+1]}
    }

    updateEstimatedPos() {
        const now = Date.now();
        const prevAndNext = this.props.plan.waypoints;
        const isExecutingPlan = prevAndNext[0].eta < now && prevAndNext[prevAndNext.length - 1].eta > now; 
        if (isExecutingPlan){
            const prevAndNext = this.getPrevAndNextWaypoints(now);
            const prevWaypoint = prevAndNext.prev;
            const nextWaypoint = prevAndNext.next;
            const deltaTime = (nextWaypoint.eta - prevWaypoint.eta)/1000;
            const timeSince = (now - prevWaypoint.eta)/1000;
            const newEstimatedPosition = {
                latitude: prevWaypoint.latitude + (nextWaypoint.latitude - prevWaypoint.latitude) * (timeSince / deltaTime),
                longitude: prevWaypoint.longitude + (nextWaypoint.longitude - prevWaypoint.longitude) * (timeSince / deltaTime)
            }
            this.setState({ estimatedPos: newEstimatedPosition })
        }
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