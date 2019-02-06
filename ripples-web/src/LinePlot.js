import React, { Component } from 'react';
import {Line} from 'react-chartjs-2'
import { timestampMsToReadableDate } from './utils/DateUtils';

/**
 * Responsible for drawing line charts
 */
export default class LinePlot extends Component {
    constructor(props){
        super(props)
        let x = [];
        let y = [];
        let humanReadableTime = timestampMsToReadableDate(props.data.timestamp);
        props.data.samples.forEach(point => {
            y.push((point[0]/10).toFixed(1))
            x.push(point[1])
        })

        this.state = {
            data: {
                labels: x,
                datasets: [{ 
                    data: y,
                    label: props.data.type,
                    borderColor: "#ff0000",
                    fill: false
                  }]
                },
            options: {
                title: {
                    display: true,
                    text: `${props.data.type} data collected at ${humanReadableTime}`
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: `depth`
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: `${props.data.type}`
                        }
                    }]
                },
                maintainAspectRatio: false
            }
        }
    }
    render() {
        
        return (
            <Line data={this.state.data} width={500} height={500} options={this.state.options}>
            </Line>
        )
    }
}