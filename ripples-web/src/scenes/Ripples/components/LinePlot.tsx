import { ResponsiveLine } from '@nivo/line'
import React, { Component } from 'react'
import IProfile from '../../../model/IProfile'
import { timestampMsToReadableDate } from '../../../services/DateUtils'

interface PropsType {
  data: IProfile
}

interface XYPoint {
  x: number
  y: number
}

interface StateType {
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
export default class LinePlot extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props)
    const data: XYPoint[] = props.data.samples.map(point => {
      return { y: +(point[0] / 10), x: +point[1] }
    })
    const maxDepth = Math.max(...data.map(p => p.y)) - 0.9
    const xMap = data.map(p => p.x)
    const minTemp = Math.min(...xMap)
    const maxTemp = Math.max(...xMap)
    const humanReadableTime = timestampMsToReadableDate(this.props.data.timestamp)
    const type = props.data.type
    this.state = {
      maxDepth,
      maxTemp,
      minTemp,
      processedData: data,
      time: humanReadableTime,
      type,
    }
  }

  public render() {
    return (
      <div className="chartwrapper">
        <span>
          {this.state.type} plot at {this.state.time}
        </span>
        <ResponsiveLine
          key={'plot_' + this.props.data.timestamp}
          data={[
            {
              data: this.state.processedData,
              id: 'depth',
            },
          ]}
          curve="monotoneX"
          margin={{
            bottom: 50,
            left: 20,
            right: 10,
            top: 30,
          }}
          xScale={{
            max: Math.ceil(this.state.maxTemp),
            min: Math.floor(this.state.minTemp),
            stacked: true,
            type: 'linear',
          }}
          yScale={{
            max: +this.state.maxDepth + 1,
            min: 'auto',
            stacked: true,
            type: 'linear',
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            legend: `${this.state.type}`,
            legendOffset: 36,
            legendPosition: 'middle',
            tickPadding: 5,
            tickRotation: 0,
            tickSize: 5,
          }}
          axisLeft={{
            legend: 'depth',
            legendOffset: -40,
            legendPosition: 'middle',
            tickPadding: 5,
            tickRotation: 0,
            tickSize: 5,
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
              anchor: 'top',
              direction: 'row',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
              itemDirection: 'left-to-right',
              itemHeight: 20,
              itemOpacity: 0.75,
              itemWidth: 80,
              itemsSpacing: 0,
              justify: false,
              symbolShape: 'circle',
              symbolSize: 12,
              translateX: 0,
              translateY: 0,
            },
          ]}
        />
      </div>
    )
  }
}
