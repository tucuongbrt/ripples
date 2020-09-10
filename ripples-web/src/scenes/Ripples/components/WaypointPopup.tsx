import React, { Component } from 'react'
import { connect } from 'react-redux'
import IRipplesState from '../../../model/IRipplesState'
import { Popup } from 'react-leaflet'
import { IVehicleAtTime } from '../../../model/IPositionAtTime'
import { FormGroup, Label, Input } from 'reactstrap'
import IPlan from '../../../model/IPlan'
import CustomDatePicker from './CustomDatePicker'

interface PropsType {
  wp: IVehicleAtTime
  selectedPlan: IPlan
  selectedWaypointIdx: number
  updateWaypoint: (wp: IVehicleAtTime, property: string, value: any) => void
}

class WaypointPopup extends Component<PropsType, {}> {
  render() {
    const { wp, updateWaypoint } = this.props
    return (
      <Popup className="waypoint-popup">
        <FormGroup>
          <Label for="latitude">Latitude</Label>
          <Input
            type="number"
            name="latitude"
            id="latitude"
            value={wp.latitude}
            min={-90}
            max={90}
            onChange={(e) => updateWaypoint(wp, 'latitude', e.target.value)}
            className="form-control form-control-sm"
          />
        </FormGroup>
        <FormGroup>
          <Label for="longitude">Longitude</Label>
          <Input
            type="number"
            name="longitude"
            id="longitude"
            min={-180}
            max={180}
            value={wp.longitude}
            onChange={(e) => updateWaypoint(wp, 'longitude', e.target.value)}
            className="form-control form-control-sm"
          />
        </FormGroup>
        <FormGroup>
          <Label for="depth">Depth (m)</Label>
          <Input
            type="number"
            name="depth"
            id="depth"
            value={wp.depth}
            onChange={(e) => updateWaypoint(wp, 'depth', e.target.value)}
            className="form-control form-control-sm"
          />
        </FormGroup>
        {this.buildTimestampInputs()}
      </Popup>
    )
  }

  buildTimestampInputs() {
    const { selectedPlan, wp, selectedWaypointIdx } = this.props

    if (!selectedPlan.waypoints.length) return
    const initWp = selectedPlan.waypoints[0]

    return selectedPlan.survey && this.isLastWaypoint() ? (
      <>
        <CustomDatePicker label={'Initial timestamp'} wp={initWp} wpIndex={0} />
        <CustomDatePicker label={'Final timestamp'} wp={wp} wpIndex={selectedWaypointIdx} />
      </>
    ) : (
      <CustomDatePicker label={'Timestamp'} wp={wp} wpIndex={selectedWaypointIdx} />
    )
  }

  isLastWaypoint() {
    const { selectedWaypointIdx, selectedPlan } = this.props
    return selectedWaypointIdx === selectedPlan.waypoints.length - 1
  }
}

function mapStateToProps(state: IRipplesState) {
  const { selectedPlan, selectedWaypointIdx } = state
  return {
    selectedPlan,
    selectedWaypointIdx,
  }
}

export default connect(mapStateToProps, null)(WaypointPopup)
