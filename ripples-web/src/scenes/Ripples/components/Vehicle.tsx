import React, { Component } from 'react'
import { Popup } from 'react-leaflet'
import { timestampMsToReadableDate } from '../../../services/DateUtils'
import { AuvIcon } from './Icons'
import RotatedMarker from './RotatedMarker'
import { getLatLng } from '../../../services/PositionUtils';
import IAsset from '../../../model/IAsset';
import IRipplesState from '../../../model/IRipplesState';
import { connect } from 'react-redux';
import IAssetAwareness from '../../../model/IAssetAwareness';
import AssetAwareness from './AssetAwareness';

type propsType = {
    data: IAsset,
    sliderValue: number
}

class Vehicle extends Component<propsType, {}> {

    constructor(props: propsType) {
        super(props);
        this.buildVehicleAwareness = this.buildVehicleAwareness.bind(this)
        this.buildVehicle = this.buildVehicle.bind(this)
    }

    buildSettings(settings: string[][]): JSX.Element[] {
        return settings.map(pair => <li key={pair[0]} > {pair[0]}: {pair[1]}</li>)
    }

    buildVehicleAwareness(): JSX.Element {
        const currentVehicle = this.props.data
        const deltaHours = this.props.sliderValue
        const vehicleAwareness: IAssetAwareness = {
            name: currentVehicle.name,
            positions: currentVehicle.awareness
        }
        return <AssetAwareness awareness={vehicleAwareness} deltaHours={deltaHours}></AssetAwareness>
    }

    buildVehicle() {
        let vehicle = this.props.data;
        const systemPosition = getLatLng(vehicle.lastState)
        return (
            <RotatedMarker
                position={systemPosition}
                icon={new AuvIcon()}
                rotationAngle={0}
                rotationOrigin={'center'}>
                <Popup>
                    <h3>{vehicle.name}</h3>
                    <h5>State</h5>
                    <ul>
                        <li>Lat: {vehicle.lastState.latitude.toFixed(5)}</li>
                        <li>Lng: {vehicle.lastState.longitude.toFixed(5)}</li>
                        <li>Fuel: {vehicle.lastState.fuel.toFixed(2)}</li>
                        <li>Heading: {vehicle.lastState.heading.toFixed(2)}</li>
                        <li>Date: {timestampMsToReadableDate(vehicle.lastState.timestamp)}</li>
                    </ul>
                    <h5>Settings</h5>
                    <ul>
                        {this.buildSettings(vehicle.settings)}
                    </ul>
                </Popup>
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

function mapStateToProps(state: IRipplesState) {
    return {
        sliderValue: state.sliderValue,
    }
}


export default connect(mapStateToProps, null)(Vehicle)