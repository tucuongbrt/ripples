import React, { Component } from "react";
import IRipplesState from "../../../model/IRipplesState";
import { connect } from "react-redux";
import IAsset from "../../../model/IAsset";
import Vehicle from "./Vehicle";
import Spot from "./Spot";
import IAisShip, { IShipLocation } from "../../../model/IAisShip";
import AISShip from "./AISShip";
import { Map, TileLayer, LayerGroup, LayersControl, GeoJSON, FeatureGroup } from 'react-leaflet'
import { LatLngLiteral } from "leaflet";
import { setSelectedWaypointIdx, updateWpLocation, addWpToPlan, setSidePanelVisibility} from "../../../redux/ripples.actions";
import 'react-leaflet-fullscreen-control'
const { BaseLayer, Overlay } = LayersControl
import GeoData from '../../../assets/geojson/all.json';
import IProfile from "../../../model/IProfile";
import VerticalProfile from "./VerticalProfile";
import IPlan from "../../../model/IPlan";
import VehiclePlan from "./VehiclePlan";
import { ToolSelected } from "../../../model/ToolSelected";
import IPositionAtTime from "../../../model/IPositionAtTime";
import ILatLng from "../../../model/ILatLng";
import AISCanvas from "./AISCanvas";
const CanvasLayer = require('react-leaflet-canvas-layer');

type propsType = {
    aisLocations: IShipLocation[]
    vehicles: IAsset[]
    spots: IAsset[]
    aisShips: IAisShip[]
    profiles: IProfile[]
    plans: IPlan[]
    selectedPlan: IPlan
    selectedWaypointIdx: number
    toolSelected: ToolSelected
    setSelectedWaypointIdx: (_: number) => void
    updateWpLocation: (_: ILatLng) => void
    addWpToPlan: (_: IPositionAtTime) => void
    setSidePanelVisibility: (_: boolean) => void
}

type stateType = {
    initCoords: LatLngLiteral
    isToDrawAisLocations: boolean
    perpLinesSize: number
    geojsonData: any[]
}

class RipplesMap extends Component<propsType, stateType> {
    upgradedOptions: any;
    initZoom = 10;

    constructor(props: propsType) {
        super(props)
        this.state = {
            initCoords: { lat: 41.18, lng: -8.7, },
            isToDrawAisLocations: false,
            geojsonData: GeoData,
            perpLinesSize: 10,
        }
        super(props)
        this.buildProfiles = this.buildProfiles.bind(this)
        this.buildVehicles = this.buildVehicles.bind(this)
        this.buildSpots = this.buildSpots.bind(this)
        this.buildAisShips = this.buildAisShips.bind(this)
        this.handleMapClick = this.handleMapClick.bind(this)
        this.handleZoom = this.handleZoom.bind(this)
        this.drawCanvas = this.drawCanvas.bind(this)
        this.toggleDrawAisLocations = this.toggleDrawAisLocations.bind(this)
    }

    /**
     * Move waypoint if a plan and a waypoint are selected
     * @param e 
     */
    handleMapClick(e: any) {
        this.props.setSidePanelVisibility(false)
        if (this.props.selectedPlan.id.length == 0) return
        const clickLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
        switch (this.props.toolSelected) {
            case ToolSelected.ADD: {
                this.props.addWpToPlan(Object.assign({}, clickLocation, { timestamp: 0 }))
                break
            }
            case ToolSelected.MOVE: {
                if (this.props.selectedWaypointIdx != -1) {
                    this.props.updateWpLocation(clickLocation)
                    this.props.setSelectedWaypointIdx(-1)
                }
            }
        }
    }

    buildProfiles() {
        return this.props.profiles.map((profile, i) => {
            return <VerticalProfile key={"profile" + i} data={profile}></VerticalProfile>
        })
    }



    buildSpots() {
        return this.props.spots.map(spot => {
            return <Spot key={spot.imcid} data={spot}></Spot>
        })
    }

    buildPlans(): JSX.Element[] {
        return this.props.plans.map(p => {
            return (
                <VehiclePlan
                    key={"VehiclePlan" + p.id}
                    plan={p}
                    vehicle={p.assignedTo}
                >
                </VehiclePlan>
            )
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
        return this.props.aisShips.map((ship) => {
            return <AISShip
                key={"Ship_" + ship.mmsi}
                ship={ship}
            >

            </AISShip>
        })
    }

    drawCanvas(info: any) {
        const ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = 'rgba(255,116,0, 0.2)';
        this.props.aisShips.forEach((ship) => {
            const aisCanvas = new AISCanvas({
                ship,
                perpLinesSize: this.state.perpLinesSize,
                drawLocation: this.state.isToDrawAisLocations,
            })
            aisCanvas.drawInCanvas(info)
        })
    }

    onEachFeature(feature: any, layer: any) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.Name) {
            let content = `<h5>${feature.properties.Name}</h5>`;
            if (feature.properties.description) content += feature.properties.description;
            layer.bindPopup(content);
        }
    }

    buildGeoJSON() {
        return this.state.geojsonData.map((json, i) => {
            return <GeoJSON key={"geojson" + i} data={json} onEachFeature={this.onEachFeature} style={(feature: any) => {
                let color;
                switch (feature.properties.Name) {
                    case 'PNLN': color = "#e5af3b"; break;
                    case 'Inner Circle': color = "#e3e800"; break;
                    case 'Outer Circle': color = "#961400"; break;
                    default: color = "#48cc02"; break;
                }
                return {
                    color: color,
                    opacity: 0.5,
                    weight: 2,
                }
            }

            }></GeoJSON>
        })
    }


    handleZoom(e: any) {
        const newZoom = e.target._animateToZoom
        let newLineLength = 0;
        if (newZoom > 7) {
            newLineLength = 138598 * Math.pow(newZoom, -2.9)
            this.setState({
                perpLinesSize: Math.round(newLineLength),
            })
            if (newZoom > 12) {
                if (!this.state.isToDrawAisLocations) {
                    this.toggleDrawAisLocations()
                }
            } else {
                if (this.state.isToDrawAisLocations) {
                    this.toggleDrawAisLocations()
                }
            }
        }
    }

    toggleDrawAisLocations() {
        this.setState({
            isToDrawAisLocations: !this.state.isToDrawAisLocations
        })
    }

    render() {
        return (
            <Map fullscreenControl center={this.state.initCoords} zoom={this.initZoom} maxZoom={20}
                onClick={this.handleMapClick} onZoomend={this.handleZoom}>
                <LayersControl position="topright">
                    <BaseLayer checked name="OpenStreetMap.Mapnik">
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>
                    <Overlay name="Nautical charts">
                        <TileLayer
                            url='http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4'
                            attribution='Map data &copy; Transas Nautical Charts'
                            tms={true}
                            maxZoom={21}
                            opacity={0.7}
                            maxNativeZoom={17}>
                        </TileLayer>
                    </Overlay>
                    <Overlay name="KML" checked>
                        <FeatureGroup>
                            {this.buildGeoJSON()}
                        </FeatureGroup>
                    </Overlay>
                    <Overlay checked name="Vehicles">
                        <LayerGroup>
                            {this.buildVehicles()}
                        </LayerGroup>
                    </Overlay>
                    <Overlay checked name="Plans">
                        <LayerGroup>
                            {this.buildPlans()}
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
                            <CanvasLayer drawMethod={this.drawCanvas} />
                        </LayerGroup>
                    </Overlay>
                    <Overlay checked name="Profiles Data">
                        <LayerGroup>
                            {this.buildProfiles()}
                        </LayerGroup>
                    </Overlay>
                </LayersControl>
                />
            </Map>
        )

    }

}

function mapStateToProps(state: IRipplesState) {
    return {
        vehicles: state.assets.vehicles,
        spots: state.assets.spots,
        aisShips: state.assets.aisShips,
        selectedWaypointIdx: state.selectedWaypointIdx,
        selectedPlan: state.selectedPlan,
        profiles: state.profiles,
        plans: state.planSet,
        toolSelected: state.toolSelected,
        aisLocations: state.assets.aisDrawableLocations,
    }
}

const actionCreators = {
    setSelectedWaypointIdx,
    updateWpLocation,
    addWpToPlan,
    setSidePanelVisibility,
}


export default connect(mapStateToProps, actionCreators)(RipplesMap)