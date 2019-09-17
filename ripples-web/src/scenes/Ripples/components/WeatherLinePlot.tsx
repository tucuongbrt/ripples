import { ResponsiveLine } from '@nivo/line'
import React, { Component } from 'react'
import { formatWeatherParam, WeatherParam } from '../../../model/WeatherParam'
import { WeatherData } from '../../../services/WeatherUtils'

interface PropsType {
  param: WeatherParam
  data: WeatherData[]
}

interface StateType {
  yMin: number
  yMax: number
}

/**
 * Responsible for drawing weather line charts w/ multiple data sources
 */
export default class WeatherLinePlot extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props)
    const yValues = props.data.map((wd: WeatherData) => wd.data.map(p => p.y)).flat()
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    this.state = {
      yMin,
      yMax,
    }
  }

  public render() {
    return (
      <div id="weatherPlot">
        <span>{formatWeatherParam(this.props.param)} -48h/+48h plot</span>
        <div className="chartwrapper">
          <div className="chartAreaWrapper">
            <ResponsiveLine
              key={`plot-${this.props.param}`}
              data={this.props.data}
              curve="monotoneX"
              margin={{
                bottom: 50,
                left: 20,
                right: 200,
                top: 30,
              }}
              xScale={{
                max: 48,
                min: -48,
                type: 'linear',
              }}
              yScale={{
                max: this.state.yMax + 1,
                min: this.state.yMin - 1,
                type: 'linear',
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                legend: 'Timestamp',
                legendOffset: 36,
                legendPosition: 'middle',
                tickPadding: 5,
                tickRotation: 0,
                tickSize: 5,
              }}
              axisLeft={{
                legend: `${formatWeatherParam(this.props.param)}`,
                legendOffset: -40,
                legendPosition: 'middle',
                tickPadding: 5,
                tickRotation: 0,
                tickSize: 5,
              }}
              colors={{ scheme: 'nivo' }}
              lineWidth={2}
              enablePoints={false}
              animate={false}
              isInteractive={true}
              useMesh={true}
              motionStiffness={90}
              motionDamping={15}
              legends={[
                {
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </div>
        {this.props.param.includes('Direction') && <span>0º points North</span>}
      </div>
    )
  }
}
