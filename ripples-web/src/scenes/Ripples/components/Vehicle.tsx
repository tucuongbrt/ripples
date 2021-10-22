import React, { Component } from 'react'
import { connect } from 'react-redux'
import IAsset from '../../../model/IAsset'
import IAssetAwareness from '../../../model/IAssetAwareness'
import IRipplesState from '../../../model/IRipplesState'
import {
  setEditVehicle,
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
} from '../../../redux/ripples.actions'
import DateService from '../../../services/DateUtils'
import PositionService from '../../../services/PositionUtils'
import AssetAwareness from './AssetAwareness'
import {
  AuvOrangeIcon,
  AuvOrangeSmallIcon,
  mantaIcon,
  WavyLittoralIcon,
  WavyBasicIcon,
  WavyOceanIcon,
  WavyDummyIcon,
  AvGenericSmallIcon,
  AvGenericIcon,
  AuvYellowIcon,
  AuvYellowSmallIcon,
  AuvRedIcon,
  AuvRedSmallIcon,
} from './Icons'
import RotatedMarker from './RotatedMarker'

interface PropsType {
  data: IAsset
  sliderValue: number
  currentTime: number
  isVehiclesLayerActive: boolean
  currentZoom: number
  setSidePanelTitle: (title: string) => void
  setSidePanelContent: (content: any) => void
  setSidePanelVisibility: (v: boolean) => void
  setEditVehicle: (_: IAsset) => void
  setAssetSelected: (_: IAsset | undefined) => void
}

class Vehicle extends Component<PropsType, {}> {
  public auvOrangeIcon = new AuvOrangeIcon()
  public auvOrangeSmallIcon = new AuvOrangeSmallIcon()
  public auvYellowIcon = new AuvYellowIcon()
  public auvYellowSmallIcon = new AuvYellowSmallIcon()
  public auvRedIcon = new AuvRedIcon()
  public auvRedSmallIcon = new AuvRedSmallIcon()
  public avGenericIcon = new AvGenericIcon()
  public avGenericSmallIcon = new AvGenericSmallIcon()
  public mantaIcon = new mantaIcon()
  public wavyBasicIcon = new WavyBasicIcon()
  public wavyLittoralIcon = new WavyLittoralIcon()
  public wavyOceanIcon = new WavyOceanIcon()
  public wavyDummyIcon = new WavyDummyIcon()
  private positionService: PositionService = new PositionService()

  constructor(props: PropsType) {
    super(props)
    this.onMarkerClick = this.onMarkerClick.bind(this)
  }

  public shouldComponentUpdate(newProps: PropsType, newState: any) {
    return newProps.isVehiclesLayerActive
  }

  public buildSettings(settings: string[][]): any {
    const object: any = {}
    for (const pair of settings) {
      object[pair[0]] = pair[1]
    }
    return object
  }

  public getIcon(assetName: string) {
    if (assetName.startsWith('manta')) {
      return this.mantaIcon
    } else if (assetName.startsWith('WL')) {
      return this.wavyLittoralIcon
    } else if (assetName.startsWith('WB')) {
      return this.wavyBasicIcon
    } else if (assetName.startsWith('WO')) {
      return this.wavyOceanIcon
    } else if (assetName.startsWith('WD')) {
      return this.wavyDummyIcon
    } else if (
      (assetName.startsWith('lauv-xplore') || assetName.startsWith('lauv-xtreme')) &&
      this.props.currentZoom < 11
    ) {
      return this.auvYellowSmallIcon
    } else if (assetName.startsWith('lauv-xplore') || assetName.startsWith('lauv-xtreme')) {
      return this.auvYellowIcon
    } else if (assetName.startsWith('lauv-noptilus') && this.props.currentZoom < 11) {
      return this.auvOrangeSmallIcon
    } else if (assetName.startsWith('lauv-noptilus')) {
      return this.auvOrangeIcon
    } else if (assetName.startsWith('lauv-nemo') && this.props.currentZoom < 11) {
      return this.auvRedSmallIcon
    } else if (assetName.startsWith('lauv-nemo')) {
      return this.auvRedIcon
    } else if (this.props.currentZoom < 11) {
      return this.avGenericSmallIcon
    } else {
      return this.avGenericIcon
    }
  }

  public buildVehicleAwareness(): JSX.Element {
    const currentVehicle = this.props.data
    const deltaHours = this.props.sliderValue
    const vehicleAwareness: IAssetAwareness = {
      name: currentVehicle.name,
      positions: currentVehicle.awareness,
    }
    return (
      <AssetAwareness
        awareness={vehicleAwareness}
        deltaHours={deltaHours}
        icon={this.getIcon(currentVehicle.name)}
        iconAngle={0} // is used to compensate for the icon
        currentTime={this.props.currentTime}
      />
    )
  }

  public getDisplayableProperties(vehicle: IAsset) {
    const mainProps = {
      heading: vehicle.lastState.heading.toFixed(2),
      'last update': DateService.timeFromNow(vehicle.lastState.timestamp),
      latitude: vehicle.lastState.latitude.toFixed(5),
      longitude: vehicle.lastState.longitude.toFixed(5),
      plan: vehicle.planId,
    }
    const settingsProps = this.buildSettings(vehicle.settings)
    return Object.assign({}, mainProps, settingsProps)
  }

  public onMarkerClick(vehicle: IAsset) {
    // evt.originalEvent.view.L.DomEvent.stop(evt)
    this.props.setSidePanelTitle(vehicle.name)
    this.props.setSidePanelContent(this.getDisplayableProperties(vehicle))
    this.props.setSidePanelVisibility(true)
    this.props.setEditVehicle(vehicle)
    this.props.setAssetSelected(vehicle)
  }

  public buildVehicle() {
    const vehicle = this.props.data
    const systemPosition = this.positionService.getLatLng(vehicle.lastState)
    return (
      <RotatedMarker
        position={systemPosition}
        icon={this.getIcon(vehicle.name)}
        rotationAngle={vehicle.lastState.heading} // is used to compensate for the icon
        rotationOrigin={'center'}
        onClick={(evt: any) => this.onMarkerClick(vehicle)}
      />
    )
  }

  public render() {
    let awarenessJSX: JSX.Element | null = null
    awarenessJSX = this.buildVehicleAwareness()

    return (
      <>
        {this.buildVehicle()}
        {awarenessJSX}
      </>
    )
  }
}

const actionCreators = {
  setSidePanelContent,
  setSidePanelTitle,
  setSidePanelVisibility,
  setEditVehicle,
}

function mapStateToProps(state: IRipplesState) {
  return {
    sliderValue: state.sliderValue,
  }
}

export default connect(mapStateToProps, actionCreators)(Vehicle)
