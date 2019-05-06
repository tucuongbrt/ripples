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
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import { setSelectedWaypointIdx, deleteWp, updateWpTimestamp } from '../../../redux/ripples.actions';
import { ToolSelected } from '../../../model/ToolSelected';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type propsType = {
    plan: IPlan
    vehicle: string
    selectedPlan: IPlan
    selectedWaypointIdx: number
    deleteWp: (wpIdx: number) => void
    setSelectedWaypoint: Function
    toolSelected: ToolSelected
    updateWpTimestamp: (_: any) => void
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
        this.updateEstimatedPos = this.updateEstimatedPos.bind(this);
        this.handleMarkerClick = this.handleMarkerClick.bind(this)
        this.buildEstimatedPosition = this.buildEstimatedPosition.bind(this)
    }

    componentDidMount() {
        if (this.props.plan.waypoints.length == 0) return
        this.updateEstimatedPos();
        this.timerID = window.setInterval(this.updateEstimatedPos, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    handleMarkerClick(markerIdx: number, isMovable: boolean) {
        console.log("handle marker click called: isMovable: ", isMovable)
        if (isMovable && this.props.plan.id === this.props.selectedPlan.id)
            switch (this.props.toolSelected) {
                case ToolSelected.MOVE: {
                    this.props.setSelectedWaypoint(markerIdx)
                    break;
                }
                case ToolSelected.DELETE: {
                    this.props.deleteWp(markerIdx)
                    break;
                }
            }

    }

    /**
     * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
     * @param {} positions Positions of waypoints
     */
    buildPlanLines() {
        const lineColor = this.props.selectedPlan.id == this.props.plan.id ? '#fe2900' : '#008000'
        let positions = this.props.plan.waypoints.map(wp => {
            return { lat: wp.latitude, lng: wp.longitude }
        })
        let polylines = [];
        for (let i = 0; i < positions.length - 1; i++) {
            let current: LatLngLiteral = positions[i];
            let next: LatLngLiteral = positions[i + 1];
            polylines.push(
                <Polyline key={"Polyline_" + i + "_" + this.props.plan.id} positions={[current, next]} color={lineColor}></Polyline>
            )
        }
        return polylines;
    }

    buildWaypointEta(timestamp: number) {
        return timestamp != 0 ?
            <>  <li>ETA: {timeFromNow(timestamp)}</li>
                <li>Exact ETA: {timestampMsToReadableDate(timestamp)}</li></> : <></>
    }

    onWpChange(newDate: Date | null, wpIndex: number) {
        if (newDate == undefined) return
        console.log(newDate)
        console.log(wpIndex)
        this.props.updateWpTimestamp({timestamp: newDate.getTime(),wpIndex: wpIndex});
    }

    buildPopup(isMovable: boolean, wpIndex: number, wp: IPositionAtTime) {
        const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
        if (this.props.toolSelected == ToolSelected.EDIT && isMovable && isPlanAssigned) {
            return (
                <Popup>
                    <DatePicker
                        selected={new Date(wp.timestamp)}
                        onChange={(newDate) => this.onWpChange(newDate, wpIndex)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeCaption="time"
                    />
                </Popup>
            )
        } else {
            return (
                <Popup><h4>Waypoint {wpIndex} of {this.props.plan.id}</h4>
                    <div>
                        {this.buildWaypointEta(wp.timestamp)}
                        <li>Lat: {wp.latitude.toFixed(5)}</li>
                        <li>Lng: {wp.longitude.toFixed(5)}</li>
                    </div>
                </Popup>
            )
        }
    }

    buildPlanWaypoints() {
        const plan = this.props.plan;
        const waypoints = [...plan.waypoints];
        let positions = waypoints.map(wp => {
            return { lat: wp.latitude, lng: wp.longitude }
        })
        const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
        });

        return positions.map((p, i) => {
            let isPlanSelected = this.props.selectedPlan.id == plan.id
            let eta = waypoints[i].timestamp;
            let isMovable = isPlanSelected && ((eta - Date.now()) > 0 || plan.assignedTo.length == 0);
            let className = (this.props.selectedWaypointIdx === i && isMovable) ? 'editing-waypoint' : '';
            const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon();

            return <Marker
                key={"Waypoint" + i + "_" + plan.id}
                index={i}
                position={p}
                icon={icon}
                onClick={() => this.handleMarkerClick(i, isMovable)}
                className={className}>
                {this.buildPopup(isMovable, i, waypoints[i])}
            </Marker>
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

    buildEstimatedPosition() {
        if (this.props.plan.assignedTo.length == 0) return <></>
        return (
            <EstimatedPosition
                vehicle={this.props.vehicle}
                position={this.state.estimatedPos}
                icon={new GhostIcon()}
            >
            </EstimatedPosition>
        )
    }

    render() {
        if (this.props.plan.waypoints.length == 0) return null
        return (
            <div>
                {this.buildPlanLines()}
                {this.buildPlanWaypoints()}
                {this.buildEstimatedPosition()}
            </div>
        );
    }
}

function mapStateToProps(state: IRipplesState) {
    return {
        selectedPlan: state.selectedPlan,
        selectedWaypointIdx: state.selectedWaypointIdx,
        toolSelected: state.toolSelected
    }
}

const actionCreators = {
    deleteWp: deleteWp,
    setSelectedWaypoint: setSelectedWaypointIdx,
    updateWpTimestamp,
}


export default connect(mapStateToProps, actionCreators)(VehiclePlan)