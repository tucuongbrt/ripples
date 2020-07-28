import React, { Component } from 'react'
import { FeatureGroup } from 'react-leaflet'
// @ts-ignore
import { EditControl } from 'react-leaflet-draw'
import { WaypointIcon } from './Icons'

/**
 * Polygon editor template snippet
 * adapted from https://github.com/alex3165/react-leaflet-draw
 */
export default class PolygonEditor extends Component {
  _onEdited = (e: any) => {
    let numEdited = 0
    e.layers.eachLayer(() => {
      numEdited += 1
    })
    console.log(`_onEdited: edited ${numEdited} layers`, e)

    this._onChange()
  }

  _onCreated = (e: any) => {
    const type = e.layerType
    const layer = e.layer
    if (type === 'marker') {
      console.log('_onCreated: marker created', e)
    } else {
      console.log('_onCreated: something else created:', type, e)
    }

    this._onChange()
  }

  _onDeleted = (e: any) => {
    let numDeleted = 0
    e.layers.eachLayer(() => {
      numDeleted += 1
    })
    console.log(`onDeleted: removed ${numDeleted} layers`, e)

    this._onChange()
  }

  _onMounted = (drawControl: any) => {
    console.log('_onMounted', drawControl)
  }

  _onEditStart = (e: any) => {
    console.log('_onEditStart', e)
  }

  _onEditStop = (e: any) => {
    console.log('_onEditStop', e)
  }

  _onDeleteStart = (e: any) => {
    console.log('_onDeleteStart', e)
  }

  _onDeleteStop = (e: any) => {
    console.log('_onDeleteStop', e)
  }

  _editableFG = null

  _onFeatureGroupReady = (reactFGref: any) => {
    // populate FeatureGroup with the geojson layers

    /*let leafletGeoJSON = new L.GeoJSON(getGeoJson())
    let leafletFG = reactFGref.leafletElement

    leafletGeoJSON.eachLayer((layer) => {
      leafletFG.addLayer(layer)
    })*/

    this._editableFG = reactFGref
  }

  _onChange = () => {
    if (this._editableFG) {
      // @ts-ignore
      const geojsonData = this._editableFG.leafletElement.toGeoJSON()
      console.log('geojson changed', geojsonData)
    }
  }

  render() {
    return (
      <FeatureGroup
        ref={(reactFGref) => {
          this._onFeatureGroupReady(reactFGref)
        }}
      >
        <EditControl
          position="topleft"
          onEdited={this._onEdited}
          onCreated={this._onCreated}
          onDeleted={this._onDeleted}
          onMounted={this._onMounted}
          onEditStart={this._onEditStart}
          onEditStop={this._onEditStop}
          onDeleteStart={this._onDeleteStart}
          onDeleteStop={this._onDeleteStop}
          draw={{
            polyline: false,
            circlemarker: false,
            polygon: {
              icon: WaypointIcon,
              showArea: true,
              showLength: true,
            },
          }}
          edit={{
            selectedPathOptions: {
              maintainColor: true,
              fillOpacity: 0.3,
            },
          }}
        />
      </FeatureGroup>
    )
  }
}
