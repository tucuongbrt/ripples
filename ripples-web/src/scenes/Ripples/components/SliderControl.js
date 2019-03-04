import PropTypes from 'prop-types';
import { MapControl, withLeaflet } from 'react-leaflet';
import L from 'leaflet';

const reactToCSS = require('react-style-object-to-css')

const defaultStyle = {
    width: '100%',
    height: '15px',
    borderRadius: '5px',   
    background: '#d3d3d3',
    outline: 'none',
    opacity: '0.7',
    transition: 'opacity .2s',
}

L.Control.Slider = L.Control.extend({

    initialize: function(element) {
        this.options.position = "bottomleft"
        this._onChange = element.onChange;
        this._min = element.min;
        this._max = element.max;
        this._value = element.value;
        this._style = reactToCSS(defaultStyle);
    },

    onAdd: function(map) {
        var input = L.DomUtil.create('input');
        input.type = "range"
        input.value = this._value
        input.min = this._min
        input.max = this._max
        input.addEventListener('change', this._onChange)
        input.setAttribute('style', this._style)
        return input;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.slider = function(opts) {
    return new L.Control.Slider(opts);
}

class SliderControl extends MapControl {
    createLeafletElement(props) {
      return L.control.slider(props);
    }
  }

export default withLeaflet(SliderControl);

SliderControl.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
};
  