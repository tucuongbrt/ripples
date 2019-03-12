import React, { Component } from 'react'
import { Marker, Popup, Polyline } from 'react-leaflet'
import { WaypointIcon} from './Icons'
import { timeFromNow, timestampMsToReadableDate } from '../../../services/DateUtils'
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon, LatLngExpression, LatLngLiteral } from 'leaflet';
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints } from '../../../services/PositionUtils';
import ILatLngHead from '../../../model/ILatLngHead';
import IPlan from '../../../model/IPlan';
import ILatLng from '../../../model/ILatLng';
import IPositionAtTime from '../../../model/IPositionAtTime';

type propsType = {
    plan: IPlan
    vehicle: string
    isMovable: boolean
    handleMarkerClick: Function
    handleDeleteMarker: Function
    wpSelected: number
} 

type stateType = {
    estimatedPos: ILatLngHead
}

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
export default class VehiclePlan extends Component<propsType, stateType> {
    timerID: number = 0

    constructor(props: propsType) {
        super(props);
        this.state = {
            estimatedPos: { longitude: 0, latitude: 0 , heading: 0}
        }
        this.renderPlanLines = this.renderPlanLines.bind(this);
        this.renderPlanWaypoints = this.renderPlanWaypoints.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
    }

    componentDidMount() {
        this.updateEstimatedPos();
        this.timerID = window.setInterval(this.updateEstimatedPos, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }


    /**
     * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
     * @param {} positions Positions of waypoints
     */
    renderPlanLines() {
        
        let positions = this.props.plan.waypoints.map(wp => {
            return {lat: wp.latitude, lng: wp.longitude}
        })
        let polylines = [];
        for(let i = 0; i < positions.length - 1; i++){
            let current: LatLngLiteral = positions[i];
            let next: LatLngLiteral = positions[i+1];
            polylines.push(
                <Polyline key={"Polyline_" + i + "_" + this.props.plan.id} positions={[current,next]} color='#008000'></Polyline>
            )
        }
        return polylines;
    }

    renderPopup(isMovable: boolean, wpIndex: number, wp: IPositionAtTime) {
        let popup = isMovable ? <Popup>
        <div>Click on the map to move me</div>
        <button onClick={() => this.props.handleDeleteMarker(this.props.plan.id, wpIndex)}>Delete me</button>
        </Popup> : 
        (<Popup><h4>Waypoint {wpIndex} of {this.props.plan.id}</h4>
        <div>
            <li>ETA: {timeFromNow(wp.timestamp)}</li>
            <li>Exact ETA: {timestampMsToReadableDate(wp.timestamp)}</li>
            <li>Lat: {wp.latitude.toFixed(5)}</li>
            <li>Lng: {wp.longitude.toFixed(5)}</li>
        </div></Popup>)
        return popup
    }

    renderPlanWaypoints() {
        const waypoints = this.props.plan.waypoints;
        let positions = this.props.plan.waypoints.map(wp => {
            return {lat: wp.latitude, lng: wp.longitude}
        })
        let markers: any[] = [];
        const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
          });
      
      
        positions.forEach((p, i) => {
            let eta = waypoints[i].timestamp;
            let isMovable = this.props.isMovable && (eta - Date.now()) > 0;
            let className = (this.props.wpSelected === i && isMovable) ? 'editing-waypoint' : '';
            const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon();
            
            markers.push(
                <Marker
                    key={"Waypoint" + i + "_" + this.props.plan.id}
                    index={i}
                    position={p}
                    icon={icon}
                    onClick={() => this.props.handleMarkerClick(this.props.plan.id, i, isMovable)}
                    className={className}>
                    {this.renderPopup(isMovable, i, waypoints[i])}
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