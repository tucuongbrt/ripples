import React, { Component } from "react";
import IRipplesState from "../../../model/IRipplesState";
import { connect } from "react-redux";
import IAsset, { isEmptyAsset } from "../../../model/IAsset";
import Vehicle from "./Vehicle";
import Spot from "./Spot";
import IAisShip from "../../../model/IAisShip";
import AISShip from "./AISShip";
import { Map, TileLayer, LayerGroup, LayersControl } from 'react-leaflet'
import { LatLngLiteral } from "leaflet";
import { updateWaypointsTimestampFromIndex } from "../../../services/PositionUtils";
import { setSelectedWaypoint, setVehicle } from "../../../redux/ripples.actions";
import 'react-leaflet-fullscreen-control'
const { BaseLayer, Overlay } = LayersControl

type propsType = {
    vehicles: IAsset[],
    spots: IAsset[],
    aisShips: IAisShip[],
    selectedVehicle: IAsset,
    selectedWaypointIdx: number,
    setVehicle: Function
    setSelectedWaypoint: Function
}

type stateType = {
    initCoords: LatLngLiteral,
    initZoom: number
}

class RipplesMap extends Component<propsType, stateType> {
    upgradedOptions: any;

    constructor(props: propsType) {
        super(props)
        this.state = {
            initCoords: { lat: 41.18, lng: -8.7, },
            initZoom: 10,
        }
        super(props)
        this.buildVehicles = this.buildVehicles.bind(this)
        this.buildSpots = this.buildSpots.bind(this)
        this.buildAisShips = this.buildAisShips.bind(this)
        this.handleMapClick = this.handleMapClick.bind(this)
    }



    /**
     * Move waypoint if a vehicle and a waypoint are selected
     * @param e 
     */
    handleMapClick(e: any) {
        const selectedVehicle = JSON.parse(JSON.stringify(this.props.selectedVehicle));
        const wpSelected = this.props.selectedWaypointIdx;
        if (wpSelected >= 0 && !isEmptyAsset(selectedVehicle)) {
            const newLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
            selectedVehicle.plan.waypoints[wpSelected] = Object.assign({}, newLocation, { timestamp: 0 })
            updateWaypointsTimestampFromIndex(selectedVehicle.plan.waypoints, wpSelected);
            this.props.setSelectedWaypoint(-1)
            this.props.setVehicle(selectedVehicle)
        }
    }



    buildSpots() {
        return this.props.spots.map(spot => {
            return <Spot key={spot.imcid} data={spot}></Spot>
        })
    }

    buildVehicles() {
        return this.props.vehicles.map(vehicle => {
            return <Vehicle key={vehicle.imcid}
                data={vehicle}>
            </Vehicle>
        })
    }

    buildAisShips() {
        return this.props.aisShips.map(ship => {
            return <AISShip key={"Ship_" + ship.mmsi} data={ship}></AISShip>
        })
    }

    render() {
        return (
            <Map fullscreenControl center={this.state.initCoords} zoom={this.state.initZoom}
                onClick={this.handleMapClick}>
                <LayersControl position="topright">
                    <BaseLayer checked name="OpenStreetMap.Mapnik">
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>
                    <Overlay checked name="Nautical charts">
                        <TileLayer
                            url='http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4'
                            attribution='Map data &copy; Transas Nautical Charts'
                            tms={true}
                            maxZoom={21}
                            opacity={0.7}
                            maxNativeZoom={17}>
                        </TileLayer>
                    </Overlay>
                    <Overlay checked name="Vehicles">
                        <LayerGroup>
                            {this.buildVehicles()}
                        </LayerGroup>
                    </Overlay>
                    <Overlay checked name="Spots">
                        <LayerGroup>
                            {this.buildSpots()}
                        </LayerGroup>
                    </Overlay>
                    <Overlay checked name="AIS Data">
                        <LayerGroup>
                            {this.buildAisShips()}
                        </LayerGroup>
                    </Overlay>
                </LayersControl>
                />
            </Map>
        )

    }

}

function mapStateToProps(state: IRipplesState) {
    const { assets } = state
    return {
        vehicles: assets.vehicles,
        spots: assets.spots,
        aisShips: assets.aisShips,
        selectedWaypointIdx: state.selectedWaypointIdx,
        selectedVehicle: state.selectedVehicle,
    }
}

const actionCreators = {
    setVehicle,
    setSelectedWaypoint
}


export default connect(mapStateToProps, actionCreators)(RipplesMap)