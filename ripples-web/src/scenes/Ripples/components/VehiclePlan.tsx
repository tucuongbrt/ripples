import React, { Component } from 'react'
import { Marker, Popup, Polyline } from 'react-leaflet'
import { WaypointIcon} from './Icons'
import { timeFromNow } from '../../../services/DateUtils'
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints } from '../../../services/PositionUtils';

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
export default class VehiclePlan extends Component {

    constructor(props) {
        super(props);
        this.state = {
            estimatedPos: { longitude: 0, latitude: 0 , heading: 0}
        }
        this.renderPlanLine = this.renderPlanLines.bind(this);
        this.renderPlanWaypoints = this.renderPlanWaypoints.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
    }

    componentDidMount() {
        this.updateEstimatedPos();
        const interval1 = setInterval(this.updateEstimatedPos, 1000);
        // store interval in the state so it can be accessed later:
        this.setState({ interval1: interval1 });
    }

    componentWillUnmount() {
        clearInterval(this.state.interval1);
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
            let eta = waypoints[i].timestamp;
            let isMovable = this.props.isMovable && (eta - Date.now()) > 0;
            let className = (this.props.wpSelected === i && isMovable) ? 'editing-waypoint' : '';
            const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon();
            let popup = isMovable ? <Popup>
            <div>Click on the map to move me</div>
            <button onClick={() => this.props.handleDeleteMarker(this.props.plan.id, i)}>Delete me</button>
            </Popup> : 
            (<Popup><h4>Waypoint {i} of {this.props.plan.id}</h4><span>ETA: {timeFromNow(eta)}</span></Popup>)
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

    updateEstimatedPos(date = Date.now()) {
        
        const waypoints = this.props.plan.waypoints;
        const isExecutingPlan = waypoints[0].timestamp < date && 
            waypoints[waypoints.length - 1].timestamp > date; 
        if (isExecutingPlan) {
            const prevAndNext = getPrevAndNextPoints(waypoints, date);
            const prevPoint = prevAndNext.prev;
            const nextPoint = prevAndNext.next;
            this.setState({ estimatedPos: interpolateTwoPoints(date, prevPoint, nextPoint) })
        }
    }

    render() {
        return (
            <div>
                {this.renderPlanLines()}
                {this.renderPlanWaypoints()}
                <EstimatedPosition 
                    vehicle={this.props.vehicle}
                    position={this.state.estimatedPos}>
                </EstimatedPosition>
            </div>

        );
    }
}