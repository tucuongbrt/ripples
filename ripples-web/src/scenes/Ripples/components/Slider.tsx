import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Row, Alert } from 'reactstrap'
import { Button } from 'reactstrap'
import IOverlayInfo from '../../../model/IOverlayInfo'
import IRipplesState from '../../../model/IRipplesState'
import DateService from '../../../services/DateUtils'
import '../styles/Slider.css'

interface PropsType {
  min: number
  max: number
  value: number
  mapOverlayInfo?: IOverlayInfo
  onChange: (e: number) => void
}

/**
 * A slider component
 */
class Slider extends Component<PropsType, {}> {
  public render() {
    return (
      <div className="slider">
        <Row>
          {this.props.mapOverlayInfo && this.props.mapOverlayInfo.name !== '' && (
            <Alert id="overlay-info" color="primary" className="left">
              {this.props.mapOverlayInfo.info}
            </Alert>
          )}
          <Button className="right" color="primary" onClick={() => this.props.onChange(0)}>
            Reset
          </Button>
        </Row>
        <Row>
          <Col>
            <input
              type="range"
              min={this.props.min}
              max={this.props.max}
              value={this.props.value}
              onChange={e => this.props.onChange(+e.target.value)}
              step={1 / 50}
            />
          </Col>
        </Row>
        <Row className="mt-1">
          <Col className="text-left font-weight-bold p-0">{this.props.min}h</Col>
          <Col className="text-center font-weight-bold p-0">{DateService.decimalHoursToTime(this.props.value)}</Col>
          <Col className="text-right font-weight-bold p-0">{this.props.max}h</Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps(state: IRipplesState) {
  return {
    mapOverlayInfo: state.mapOverlayInfo,
  }
}

export default connect(
  mapStateToProps,
  null
)(Slider)
