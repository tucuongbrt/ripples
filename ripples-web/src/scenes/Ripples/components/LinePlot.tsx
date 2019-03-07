import React, { Component } from 'react';
import { ResponsiveLine } from '@nivo/line'
import { timestampMsToReadableDate } from '../../../services/DateUtils';
import IProfile from '../../../model/IProfile';

type propsType = {
    data: IProfile
}

type XYPoint = {
    x: number
    y: number
}

type stateType = {
    processedData: XYPoint[]
    maxDepth: number
    minTemp: number
    maxTemp: number
    time: string
    type: string
}

/**
 * Responsible for drawing line charts
 */
export default class LinePlot extends Component<propsType, stateType> {


    constructor(props: propsType) {
        super(props)
        let data: XYPoint[] = props.data.samples.map(point => {
            return { y: +(point[0] / 10), x: +(point[1]) }
        })
        let maxDepth = Math.max(...data.map(p => p.y))
        let xMap = data.map(p => p.x);
        let minTemp = Math.min(...xMap)
        let maxTemp = Math.max(...xMap);
        let humanReadableTime = timestampMsToReadableDate(this.props.data.timestamp);
        let type = props.data.type;
        this.state = {
            processedData: data,
            maxDepth: maxDepth,
            time: humanReadableTime,
            type: type,
            minTemp: minTemp,
            maxTemp: maxTemp,
        };
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
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legend": `${this.state.type}`,
                            "legendOffset": 36,
                            "legendPosition": "middle"
                        }}
                        axisLeft={{
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