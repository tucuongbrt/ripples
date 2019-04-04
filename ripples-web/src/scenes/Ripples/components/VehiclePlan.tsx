import React, { Component } from 'react'
import { Marker, Popup, Polyline } from 'react-leaflet'
import { WaypointIcon, GhostIcon } from './Icons'
import { timeFromNow, timestampMsToReadableDate } from '../../../services/DateUtils'
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon, LatLngLiteral } from 'leaflet';
import EstimatedPosition from './EstimatedPosition';
import { interpolateTwoPoints, getPrevAndNextPoints, updateWaypointsTimestampFromIndex } from '../../../services/PositionUtils';
import IPosHeadingAtTime from '../../../model/ILatLngHead';
import IPlan from '../../../model/IPlan';
import IPositionAtTime from '../../../model/IPositionAtTime';
import VerticalProfile from './VerticalProfile';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAsset, { EmptyAsset } from '../../../model/IAsset';
import { setVehicles, setSelectedWaypoint } from '../../../redux/ripples.actions';

type propsType = {
    vehicles: IAsset[]
    plan: IPlan
    vehicle: string
    selectedVehicle: IAsset
    selectedWaypointIdx: number
    setVehicles: Function
    setSelectedWaypoint: Function
}

type stateType = {
    estimatedPos: IPosHeadingAtTime,
}

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
class VehiclePlan extends Component<propsType, stateType> {
    timerID: number = 0

    constructor(props: propsType) {
        super(props);
        this.state = {
            estimatedPos: { longitude: 0, latitude: 0, heading: 0, timestamp: Date.now() },
        }
        this.buildPlanLines = this.buildPlanLines.bind(this);
        this.buildPlanWaypoints = this.buildPlanWaypoints.bind(this);
        this.buildProfiles = this.buildProfiles.bind(this);
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
        this.handleDeleteMarker = this.handleDeleteMarker.bind(this)
        this.handleMarkerClick = this.handleMarkerClick.bind(this)
        this.isVehicleSelected = this.isVehicleSelected.bind(this)
    }

    componentDidMount() {
        this.updateEstimatedPos();
        this.timerID = window.setInterval(this.updateEstimatedPos, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    handleMarkerClick(markerIdx: number, isMovable: boolean) {
        console.log('Marker clicked', markerIdx, isMovable)
        if (isMovable && this.props.plan.id === this.props.selectedVehicle.plan.id) {
            this.props.setSelectedWaypoint(markerIdx)
        }
    }

    handleDeleteMarker(markerIdx: number) {
        const selectedVehicle = this.props.selectedVehicle
        if (this.props.plan.id === selectedVehicle.plan.id) {
            let vehiclesCopy = this.props.vehicles.slice();
            const vehicleIdx = vehiclesCopy.findIndex(v => v.name == selectedVehicle.name);
            vehiclesCopy[vehicleIdx].plan.waypoints.splice(markerIdx, 1);
            updateWaypointsTimestampFromIndex(vehiclesCopy[vehicleIdx].plan.waypoints, markerIdx);
            this.props.setVehicles(vehiclesCopy)
        }
    }

    /**
     * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
     * @param {} positions Positions of waypoints
     */
    buildPlanLines() {

        let positions = this.props.plan.waypoints.map(wp => {
            return { lat: wp.latitude, lng: wp.longitude }
        })
        let polylines = [];
        for (let i = 0; i < positions.length - 1; i++) {
            let current: LatLngLiteral = positions[i];
            let next: LatLngLiteral = positions[i + 1];
            polylines.push(
                <Polyline key={"Polyline_" + i + "_" + this.props.plan.id} positions={[current, next]} color='#008000'></Polyline>
            )
        }
        return polylines;
    }

    buildPopup(isMovable: boolean, wpIndex: number, wp: IPositionAtTime) {
        let popup = isMovable ? <Popup>
            <div>Click on the map to move me</div>
            <button onClick={() => this.handleDeleteMarker(wpIndex)}>Delete me</button>
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

    isVehicleSelected(): boolean {
        return this.props.selectedVehicle.imcid !== EmptyAsset.imcid
    }
    isThisPlanSelected(): boolean {
        return this.isVehicleSelected() ? 
            this.props.selectedVehicle.plan.id === this.props.plan.id ? true : false : false
    }

    buildPlanWaypoints() {
        const waypoints = [...this.props.plan.waypoints];
        let positions = waypoints.map(wp => {
            return { lat: wp.latitude, lng: wp.longitude }
        })
        const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
        });

        return positions.map((p, i) => {
            let eta = waypoints[i].timestamp;
            let isMovable = this.isThisPlanSelected()  && (eta - Date.now()) > 0;
            let className = (this.props.selectedWaypointIdx === i && isMovable) ? 'editing-waypoint' : '';
            const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon();

            return <Marker
                key={"Waypoint" + i + "_" + this.props.plan.id}
                index={i}
                position={p}
                icon={icon}
                onClick={() => this.handleMarkerClick(i, isMovable)}
                className={className}>
                {this.buildPopup(isMovable, i, waypoints[i])}
            </Marker>
        })
    }

    buildProfiles() {
        return this.props.plan.profiles.map((profile, i) => {
            return <VerticalProfile key={"profile" + i} data={profile}></VerticalProfile>
        })
    }

    updateEstimatedPos() {
        const now = Date.now()
        const waypoints = this.props.plan.waypoints;
        const planStarted = now >= waypoints[0].timestamp
        const planEnded = now > waypoints[waypoints.length - 1].timestamp
        const isExecutingPlan = planStarted && !planEnded
        if (isExecutingPlan) {
            const prevAndNext = getPrevAndNextPoints(waypoints, now);
            const prevPoint = prevAndNext.prev;
            const nextPoint = prevAndNext.next;
            this.setState({ estimatedPos: interpolateTwoPoints(now, prevPoint, nextPoint) })
        } else if (!planStarted) {
            this.setState({ estimatedPos: Object.assign({}, waypoints[0], { heading: 0 }) })
        } else { // plan ended
            this.setState({ estimatedPos: Object.assign({}, waypoints[waypoints.length - 1], { heading: 0 }) })
        }
    }

    render() {
        return (
            <div>
                {this.buildPlanLines()}
                {this.buildPlanWaypoints()}
                {this.buildProfiles()}
                <EstimatedPosition
                    vehicle={this.props.vehicle}
                    position={this.state.estimatedPos}
                    icon={new GhostIcon()}
                    >
                </EstimatedPosition>
            </div>

        );
    }
}

function mapStateToProps(state: IRipplesState) {
    return {
        vehicles: state.assets.vehicles,
        selectedVehicle: state.selectedVehicle,
        selectedWaypointIdx: state.selectedWaypointIdx,
    }
}

const actionCreators = {
    setVehicles,
    setSelectedWaypoint,
}


export default connect(mapStateToProps, actionCreators)(VehiclePlan)