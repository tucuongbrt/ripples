import React, { Component } from 'react';
import { ResponsiveLine } from '@nivo/line'
import { timestampMsToReadableDate } from './utils/DateUtils';

/**
 * Responsible for drawing line charts
 */
export default class LinePlot extends Component {


    constructor(props) {
        super(props)
        let data = props.data.samples.map(point => {
            return { y: +(point[0] / 10), x: +(point[1]) }
        })
        let maxDepth = Math.max(...data.map(p => p.y))
        let xMap = data.map(p => p.x);
        let minTemp = Math.min(...xMap)
        let maxTemp = Math.max(...xMap);
        let humanReadableTime = timestampMsToReadableDate(this.props.data.timestamp);
        let type = props.data.type;
        console.log(data);
        this.state = {
            processedData: data,
            maxDepth: maxDepth,
            time: humanReadableTime,
            type: type,
            minTemp: minTemp,
            maxTemp: maxTemp,
        };
        console.log(this.state.maxDepth)
    }

    render() {

        return (
                <div className="chartwrapper">
                    <span>{this.state.type} plot at {this.state.time}</span>
                    <ResponsiveLine
                        key={"plot_" + this.props.data.timestamp}
                        data={[{
                            "id": "depth",
                            "data": this.state.processedData
                        }]}
                        curve="monotoneX"
                        margin={{
                            "top": 30,
                            "right": 10,
                            "bottom": 50,
                            "left": 20
                        }}
                        xScale={{
                            "type": "linear",
                            "stacked": true,
                            "min": Math.floor(this.state.minTemp),
                            "max": Math.ceil(this.state.maxTemp)
                        }}
                        yScale={{
                            "type": "linear",
                            "stacked": true,
                            "min": "auto",
                            "max": (+this.state.maxDepth+1)
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            "orient": "bottom",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legend": `${this.state.type}`,
                            "legendOffset": 36,
                            "legendPosition": "middle"
                        }}
                        axisLeft={{
                            "orient": "left",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legend": "depth",
                            "legendOffset": -40,
                            "legendPosition": "middle"
                        }}
                        dotSize={10}
                        dotColor="inherit:darker(0.3)"
                        dotBorderWidth={2}
                        dotBorderColor="#ffffff"
                        enableDotLabel={false}
                        dotLabel="y"
                        dotLabelYOffset={-12}
                        animate={false}
                        motionStiffness={90}
                        motionDamping={15}
                        colors="set1"
                        legends={[
                            {
                                "anchor": "top",
                                "direction": "row",
                                "justify": false,
                                "translateX": 0,
                                "translateY": 0,
                                "itemsSpacing": 0,
                                "itemDirection": "left-to-right",
                                "itemWidth": 80,
                                "itemHeight": 20,
                                "itemOpacity": 0.75,
                                "symbolSize": 12,
                                "symbolShape": "circle",
                                "symbolBorderColor": "rgba(0, 0, 0, .5)",
                                "effects": [
                                    {
                                        "on": "hover",
                                        "style": {
                                            "itemBackground": "rgba(0, 0, 0, .03)",
                                            "itemOpacity": 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
        )
    }
}