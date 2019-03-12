import React, { Component } from 'react';
import '../styles/Slider.css';
import { Row, Col } from 'reactstrap';


type propsType = {
    min: number
    max: number
    value: number
    onChange: Function
}


/**
 * A slider component
 */
export default class Slider extends Component<propsType, {}> {

    render() {
        return (
        <div className="slider">
        <Row>
        
        <input 
        type="range" 
        min={this.props.min} 
        max={this.props.max} 
        value={this.props.value}
        onChange={ e => this.props.onChange(e)}
        step={0.1}
        ></input>
        </Row>
        <Row className="mt-2">
        <Col className="text-left font-weight-bold p-0">{this.props.min}h</Col>
        <Col className="text-center font-weight-bold p-0">{this.props.value}h</Col>
        <Col className="text-right font-weight-bold p-0">{this.props.max}h</Col>
        </Row>
        </div>

        )
    }
}