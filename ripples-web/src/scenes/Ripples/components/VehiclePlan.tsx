import { divIcon, LatLngLiteral } from 'leaflet'
import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { renderToStaticMarkup } from 'react-dom/server'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import IPosHeadingAtTime from '../../../model/ILatLngHead'
import IPlan from '../../../model/IPlan'
import IPositionAtTime from '../../../model/IPositionAtTime'
import IRipplesState from '../../../model/IRipplesState'
import { ToolSelected } from '../../../model/ToolSelected'
import { deleteWp, setEditVehicle, setSelectedWaypointIdx, updateWpTimestamp } from '../../../redux/ripples.actions'
import { setSidePanelContent, setSidePanelTitle, setSidePanelVisibility } from '../../../redux/ripples.actions'
import DateService from '../../../services/DateUtils'
import { WaypointIcon } from './Icons'

interface PropsType {
  plan: IPlan
  vehicle: string
  selectedPlan: IPlan
  selectedWaypointIdx: number
  currentTime: number
  deleteWp: (wpIdx: number) => void
  setSelectedWaypoint: (_: number) => void
  toolSelected: ToolSelected
  updateWpTimestamp: (_: any) => void
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (v: IAsset | undefined) => void
}

interface StateType {
  estimatedPos: IPosHeadingAtTime
}

/**
 * Renders a vehicle plan (line, waypoints and 'ghost')
 */
class VehiclePlan extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props)
    this.state = {
      estimatedPos: { longitude: 0, latitude: 0, heading: 0, timestamp: Date.now() },
    }
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
  }

  public componentDidMount() {
    if (this.props.plan.waypoints.length === 0) {
      return
    }
  }

  public handleMarkerClick(markerIdx: number) {
    if (this.props.plan.id === this.props.selectedPlan.id) {
      this.props.updateWpTimestamp({ timestamp: 0, wpIndex: markerIdx })
    }
    this.props.setSidePanelTitle(`Waypoint ${markerIdx} of ${this.props.plan.id}`)
    this.props.setSidePanelContent(this.getWaypointSidePanelProperties(this.props.plan.waypoints[markerIdx]))
    this.props.setSidePanelVisibility(true)
    this.props.setEditVehicle(undefined)
  }

  public getWaypointSidePanelProperties(wp: IPositionAtTime) {
    return {
      eta: wp.timestamp ? DateService.timeFromNow(wp.timestamp) : 'N/D',
      'exact eta': wp.timestamp ? DateService.timestampMsToReadableDate(wp.timestamp) : 'N/D',
      lat: wp.latitude.toFixed(5),
      lng: wp.longitude.toFixed(5),
    }
  }

  /**
   * Multiple polylines need to be rendered so that the plan can be edit to not be a single line
   * @param {} positions Positions of waypoints
   */
  public buildPlanLines() {
    const lineColor =
      this.props.selectedPlan.id === this.props.plan.id
        ? '#fe2900'
        : this.props.plan.type === 'dune'
        ? '#008000'
        : '#000080'
    const positions = this.props.plan.waypoints.map((wp) => {
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
    return (
      timestamp !== 0 && (
        <>
          {' '}
          <li>ETA: {DateService.timeFromNow(timestamp)}</li>
          <li>Exact ETA: {DateService.timestampMsToReadableDate(timestamp)}</li>
        </>
      )
    )
  }

  public onWpChange(newDate: Date | null, wpIndex: number) {
    if (!newDate) {
      return
    }
    this.props.updateWpTimestamp({ timestamp: newDate.getTime(), wpIndex })
  }

  public buildPopup(isMovable: boolean, wpIndex: number, wp: IPositionAtTime) {
    return (
      <Popup>
        <DatePicker
          selected={wp.timestamp === 0 ? new Date() : new Date(wp.timestamp)}
          onChange={(newDate) => this.onWpChange(newDate, wpIndex)}
          showTimeSelect={true}
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          timeCaption="time"
        />
      </Popup>
    )
  }

  public buildPlanWaypoints() {
    const plan = this.props.plan
    const waypoints = [...plan.waypoints]
    const positions = waypoints.map((wp) => {
      return { lat: wp.latitude, lng: wp.longitude }
    })
    const iconMarkup = renderToStaticMarkup(<i className="editing-waypoint" />)
    const customMarkerIcon = divIcon({
      html: iconMarkup,
    })

    return positions.map((p, i) => {
      const isPlanSelected = this.props.selectedPlan.id === plan.id
      const eta = waypoints[i].timestamp
      const isMovable = isPlanSelected && (eta - Date.now() > 0 || plan.assignedTo.length === 0 || eta === 0)
      const className = this.props.selectedWaypointIdx === i && isMovable ? 'editing-waypoint' : ''
      const icon = className.length > 0 ? customMarkerIcon : new WaypointIcon()

      return (
        <Marker
          key={'Waypoint' + i + '_' + plan.id}
          index={i}
          position={p}
          icon={icon}
          onClick={() => this.handleMarkerClick(i)}
          className={className}
        >
          {this.buildPopup(isMovable, i, waypoints[i])}
        </Marker>
      )
    })
  }

  public render() {
    if (this.props.plan.waypoints.length === 0 || !this.props.plan.visible) {
      return null
    }
    return (
      <div>
        {this.buildPlanLines()}
        {this.buildPlanWaypoints()}
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
  setEditVehicle,
}

export default connect(mapStateToProps, actionCreators)(VehiclePlan)
