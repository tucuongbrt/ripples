import React, { Component, ChangeEvent } from 'react';
import '../styles/Slider.css';
import { Row, Col } from 'reactstrap';
import { decimalHoursToTime } from '../../../services/DateUtils'
import { Button } from 'reactstrap';

type propsType = {
    min: number
    max: number
    value: number
    onChange: (e: number) => void
}

/**
 * A slider component
 */
export default class Slider extends Component<propsType, {}> {

    render() {
        return (
        <div className="slider">
        
        <Row>
            <Button className="right" color="primary" onClick={() => this.props.onChange(0)}>Reset</Button>
        </Row>
        <Row>
            <Col>
                <input 
                    type="range" 
                    min={this.props.min} 
                    max={this.props.max} 
                    value={this.props.value}
                    onChange={ e => this.props.onChange(+e.target.value)}
                    step={1/50}
                />
            </Col>
        </Row>
        <Row className="mt-1">
        <Col className="text-left font-weight-bold p-0">{this.props.min}h</Col>
        <Col className="text-center font-weight-bold p-0">{decimalHoursToTime(this.props.value)}</Col>
        <Col className="text-right font-weight-bold p-0">{this.props.max}h</Col>
        </Row>
        </div>

        )
    }
}