import { divIcon, LatLngLiteral } from 'leaflet'
import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { renderToStaticMarkup } from 'react-dom/server'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import IPlan from '../../../model/IPlan'
import IPositionAtTime from '../../../model/IPositionAtTime'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import { deleteWp, setSelectedWaypointIdx, updateWpTimestamp } from '../../../redux/ripples.actions'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import { timeFromNow, timestampMsToReadableDate } from '../../../services/DateUtils'
import { getPrevAndNextPoints, interpolateTwoPoints } from '../../../services/PositionUtils'
import EstimatedPosition from './EstimatedPosition'
import { GhostIcon, WaypointIcon } from './Icons'

interface PropsType {
  plan: IPlan
  vehicle: string
  selectedPlan: IPlan
  selectedWaypointIdx: number
  deleteWp: (wpIdx: number) => void
  setSelectedWaypoint: (_: number) => void
  toolSelected: ToolSelected
  updateWpTimestamp: (_: any) => void
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
}

interface StateType {
  estimatedPos: IPosHeadingAtTime
}

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
class VehiclePlan extends Component<PropsType, StateType> {
  public timerID: number = 0

  constructor(props: PropsType) {
    super(props)
    this.state = {
      estimatedPos: { longitude: 0, latitude: 0, heading: 0, timestamp: Date.now() },
    }
    this.buildPlanLines = this.buildPlanLines.bind(this)
    this.buildPlanWaypoints = this.buildPlanWaypoints.bind(this)
    this.updateEstimatedPos = this.updateEstimatedPos.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.buildEstimatedPosition = this.buildEstimatedPosition.bind(this)
  }

  public componentDidMount() {
    if (this.props.plan.waypoints.length === 0) {
      return
    }
    this.updateEstimatedPos()
    this.timerID = window.setInterval(this.updateEstimatedPos, 1000)
  }

  public componentWillUnmount() {
    clearInterval(this.timerID)
  }

  public handleMarkerClick(markerIdx: number, isMovable: boolean) {
    if (isMovable && this.props.plan.id === this.props.selectedPlan.id) {
      switch (this.props.toolSelected) {
        case ToolSelected.MOVE: {
          this.props.setSelectedWaypoint(markerIdx)
          break
        }
        case ToolSelected.DELETE: {
          this.props.deleteWp(markerIdx)
          break
        }
      }
    }
    this.props.setSidePanelTitle(`Waypoint ${markerIdx} of ${this.props.plan.id}`)
    this.props.setSidePanelContent(this.getWaypointSidePanelProperties(this.props.plan.waypoints[markerIdx]))
    this.props.setSidePanelVisibility(true)
  }

  public getWaypointSidePanelProperties(wp: IPositionAtTime) {
    return {
      eta: timeFromNow(wp.timestamp),
      'exact eta': timestampMsToReadableDate(wp.timestamp),
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
    }
  }

  /**
   * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
   * @param {} positions Positions of waypoints
   */
  public buildPlanLines() {
    const lineColor = this.props.selectedPlan.id === this.props.plan.id ? '#fe2900' : '#008000'
    const positions = this.props.plan.waypoints.map(wp => {
      return { lat: wp.latitude, lng: wp.longitude }
    })
    const polylines = []
    for (let i = 0; i < positions.length - 1; i++) {
      const current: LatLngLiteral = positions[i]
      const next: LatLngLiteral = positions[i + 1]
      polylines.push(
        <Polyline key={'Polyline_' + i + '_' + this.props.plan.id} positions={[current, next]} color={lineColor} />
      )
    }
    return polylines
  }

  public buildWaypointEta(timestamp: number) {
    return timestamp !== 0 ? (
      <>
        {' '}
        <li>ETA: {timeFromNow(timestamp)}</li>
        <li>Exact ETA: {timestampMsToReadableDate(timestamp)}</li>
      </>
    ) : (
      <></>
    )
  }

  public onWpChange(newDate: Date | null, wpIndex: number) {
    if (!newDate) {
      return
    }
    this.props.updateWpTimestamp({ timestamp: newDate.getTime(), wpIndex })
  }

  public buildPopup(isMovable: boolean, wpIndex: number, wp: IPositionAtTime) {
    const isPlanAssigned = this.props.selectedPlan.assignedTo.length > 0
    if (this.props.toolSelected === ToolSelected.EDIT && isMovable && isPlanAssigned) {
      return (
        <Popup>
          <DatePicker
            selected={new Date(wp.timestamp)}
            onChange={newDate => this.onWpChange(newDate, wpIndex)}
            showTimeSelect={true}
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            timeCaption="time"
          />
        </Popup>
      )
    }
    return <></>
  }

  public buildPlanWaypoints() {
    const plan = this.props.plan
    const waypoints = [...plan.waypoints]
    const positions = waypoints.map(wp => {
      return { lat: wp.latitude, lng: wp.longitude }
    })
    const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />)
    const customMarkerIcon = divIcon({
      html: iconMarkup,
    })

    return positions.map((p, i) => {
      const isPlanSelected = this.props.selectedPlan.id === plan.id
      const eta = waypoints[i].timestamp
      const isMovable = isPlanSelected && (eta - Date.now() > 0 || plan.assignedTo.length === 0)
      const className = this.props.selectedWaypointIdx === i && isMovable ? 'editing-waypoint' : ''
      const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon()

      return (
        <Marker
          key={'Waypoint' + i + '_' + plan.id}
          index={i}
          position={p}
          icon={icon}
          onClick={() => this.handleMarkerClick(i, isMovable)}
          className={className}
        >
          {this.buildPopup(isMovable, i, waypoints[i])}
        </Marker>
      )
    })
  }

  public updateEstimatedPos() {
    const now = Date.now()
    const waypoints = this.props.plan.waypoints
    const planStarted = now >= waypoints[0].timestamp
    const planEnded = now > waypoints[waypoints.length - 1].timestamp
    const isExecutingPlan = planStarted && !planEnded
    if (isExecutingPlan) {
      const prevAndNext = getPrevAndNextPoints(waypoints, now)
      const prevPoint = prevAndNext.prev
      const nextPoint = prevAndNext.next
      this.setState({ estimatedPos: interpolateTwoPoints(now, prevPoint, nextPoint) })
    } else if (!planStarted) {
      this.setState({ estimatedPos: Object.assign({}, waypoints[0], { heading: 0 }) })
    } else {
      // plan ended
      this.setState({ estimatedPos: Object.assign({}, waypoints[waypoints.length - 1], { heading: 0 }) })
    }
  }

  public buildEstimatedPosition() {
    if (this.props.plan.assignedTo.length === 0) {
      return <></>
    }
    return <EstimatedPosition vehicle={this.props.vehicle} position={this.state.estimatedPos} icon={new GhostIcon()} />
  }

  public render() {
    if (this.props.plan.waypoints.length === 0) {
      return null
    }
    return (
      <div>
        {this.buildPlanLines()}
        {this.buildPlanWaypoints()}
        {this.buildEstimatedPosition()}
      </div>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    selectedPlan: state.selectedPlan,
    selectedWaypointIdx: state.selectedWaypointIdx,
    toolSelected: state.toolSelected,
  }
}

const actionCreators = {
  deleteWp,
  setSelectedWaypoint: setSelectedWaypointIdx,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  updateWpTimestamp,
}

export default connect(
  mapStateToProps,
  actionCreators
)(VehiclePlan)
