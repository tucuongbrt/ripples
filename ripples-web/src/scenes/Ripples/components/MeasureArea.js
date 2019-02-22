
import React, { Component } from 'react'
import { withLeaflet } from 'react-leaflet';

// Import to a different variable so you don't have to update the rest of your codes
import MeasureControlDefault from 'react-leaflet-measure';
 
// Wrap our new variable and assign it to the one we used before. The rest of the codes stays the same.
const MeasureControl = withLeaflet(MeasureControlDefault);

const nauticalMiles =
{
    factor: 1.852, // Required. Factor to apply when converting to this unit. Length in meters or area in sq meters will be multiplied by this factor.
    display: 'NM', // Required. How to display in results, like.. "300 Meters (0.3 My New Unit)".
    decimals: 2 // Number of decimals to round results when using this unit. `0` is the default value if not specified.
  }

const measureOptions = {
    units: { nauticalMiles,},
    position: 'topright',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'nauticalMiles',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares',
    activeColor: '#db4a29',
    completedColor: '#9b2d14'
  };

export default class MeasureArea extends Component {
    render(){
        return (
            <MeasureControl {...measureOptions} />
        )
    }
}