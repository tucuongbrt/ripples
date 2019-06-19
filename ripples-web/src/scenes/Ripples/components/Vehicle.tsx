import React, { Component } from 'react'
import { timeFromNow } from '../../../services/DateUtils'
import { AuvIcon } from './Icons'
import RotatedMarker from './RotatedMarker'
import { getLatLng } from '../../../services/PositionUtils';
import IAsset from '../../../model/IAsset';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAssetAwareness from '../../../model/IAssetAwareness';
import AssetAwareness from './AssetAwareness';
import { setSidePanelTitle, setSidePanelContent, setSidePanelVisibility} from '../../../redux/ripples.actions';


type propsType = {
    data: IAsset,
    sliderValue: number
    setSidePanelTitle: (title: string) => void
    setSidePanelContent: (content: any) => void
    setSidePanelVisibility: (v: boolean) => void
}

class Vehicle extends Component<propsType, {}> {

    icon = new AuvIcon()

    constructor(props: propsType) {
        super(props);
        this.buildVehicleAwareness = this.buildVehicleAwareness.bind(this)
        this.buildVehicle = this.buildVehicle.bind(this)
    }

    buildSettings(settings: string[][]): any {
        let object: any = {}
        for (let pair of settings) {
            object[pair[0]] = pair[1];
        }
        return object
    }

    buildVehicleAwareness(): JSX.Element {
        const currentVehicle = this.props.data
        const deltaHours = this.props.sliderValue
        const vehicleAwareness: IAssetAwareness = {
            name: currentVehicle.name,
            positions: currentVehicle.awareness
        }
        return <AssetAwareness
        awareness={vehicleAwareness}
        deltaHours={deltaHours}
        icon={this.icon}
        >
        </AssetAwareness>
    }

    getDisplayableProperties(vehicle: IAsset) {
        let mainProps = {
                "last update": timeFromNow(vehicle.lastState.timestamp),
                latitude: vehicle.lastState.latitude.toFixed(5),
                longitude: vehicle.lastState.longitude.toFixed(5),
                plan: vehicle.planId,
                heading: vehicle.lastState.heading.toFixed(2)
        }
        let settingsProps = this.buildSettings(vehicle.settings)
        return Object.assign({}, mainProps, settingsProps)
    }

    handleClick(vehicle: IAsset) {
        //evt.originalEvent.view.L.DomEvent.stop(evt)
        this.props.setSidePanelTitle(vehicle.name)
        this.props.setSidePanelContent(this.getDisplayableProperties(vehicle))
        this.props.setSidePanelVisibility(true)
    }

    buildVehicle() {
        let vehicle = this.props.data;
        const systemPosition = getLatLng(vehicle.lastState)
        return (
            <RotatedMarker
                position={systemPosition}
                icon={this.icon}
                rotationAngle={0}
                rotationOrigin={'center'}
                onClick={(evt: any) => this.handleClick(vehicle)}
                >
            </RotatedMarker>
        );
    }

    render() {
        let awarenessJSX: JSX.Element | null = null
        if (this.props.sliderValue != 0) {
            awarenessJSX = this.buildVehicleAwareness()
        }
        return (
            <>
                {this.buildVehicle()}
                {awarenessJSX}
            </>
        )
    }
}

const actionCreators = {
    setSidePanelTitle,
    setSidePanelContent,
    setSidePanelVisibility,
}

function mapStateToProps(state: IRipplesState) {
    return {
        sliderValue: state.sliderValue,
    }
}


export default connect(mapStateToProps, actionCreators)(Vehicle)