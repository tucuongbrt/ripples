import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateWpTimestamp } from '../../../redux/ripples.actions'
import { IVehicleAtTime } from '../../../model/IPositionAtTime'
import { FormGroup, Label } from 'reactstrap'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerPropsType {
  label: string
  wp: IVehicleAtTime
  wpIndex: number
  updateWpTimestamp: (_: any) => void
}

class CustomDatePicker extends Component<DatePickerPropsType, {}> {
  render() {
    const { label, wp, wpIndex, updateWpTimestamp } = this.props
    return (
      <FormGroup>
        <Label for="timestamp">{label}</Label>
        <div className="date-picker-control">
          <DatePicker
            selected={wp.timestamp === 0 ? new Date() : new Date(wp.timestamp)}
            onChange={(newDate: any) => updateWpTimestamp({ timestamp: newDate.getTime(), wpIndex })}
            showTimeSelect={true}
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yy, h:mm aa"
            timeCaption="time"
            className="form-control form-control-sm"
          />
          <i className="far fa-times-circle fa-lg" onClick={() => updateWpTimestamp({ timestamp: 0, wpIndex })} />
        </div>
      </FormGroup>
    )
  }
}

const actionCreators = {
  updateWpTimestamp,
}

export default connect(null, actionCreators)(CustomDatePicker)
