
var legend;

data() {
	return {
		// ...
		tileLayer: null,
		newMarker: null
	};
},
	
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

	_leafletid = 4;
	
	onAdd: function (map) {
		// Triggered when the layer is added to a map.
		//   Register a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onAdd.call(this, map);
		map.on('click', this.getFeatureInfo, this);
	},

	onRemove: function (map) {
		// Triggered when the layer is removed from a map.
		//   Unregister a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onRemove.call(this, map);
		map.off('click', this.getFeatureInfo, this);
	},

	getFeatureInfo: function (evt) {
		// Make an AJAX request to the server and hope for the best
		var url = this.getFeatureInfoUrl(evt.latlng),
		showResults = L.Util.bind(this.showGetFeatureInfo, this);
		$.ajax({
			url: url,
			success: function (data, status, xhr) {
				var err = typeof data === 'string' ? null : data;
				showResults(err, evt.latlng, data);
			},
			error: function (xhr, status, error) {
				showResults(error);  
			}
		});
	},

	getFeatureInfoUrl: function (latlng) {
		// Construct a GetFeatureInfo request URL given a point
		var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
		size = this._map.getSize(),

		params = {
			request: 'GetFeatureInfo',
			service: 'WMS',
			srs: 'EPSG:4326',
			styles: this.wmsParams.styles,
			transparent: this.wmsParams.transparent,
			version: this.wmsParams.version,      
			format: this.wmsParams.format,
			bbox: this._map.getBounds().toBBoxString(),
			height: size.y,
			width: size.x,
			layers: this.wmsParams.layers,
			query_layers: this.wmsParams.layers,
			info_format: 'text/html'
		};

		params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
		params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

		// return this._url + L.Util.getParamString(params, this._url, true);

		var url = this._url + L.Util.getParamString(params, this._url, true);


		/**
		 * CORS workaround (using a basic php proxy)
		 * 
		 * Added 2 new options:
		 *  - proxy
		 *  - proxyParamName
		 * 
		 */

		// check if "proxy" option is defined (PS: path and file name)
		if(typeof this.wmsParams.proxy !== "undefined") {

			// check if proxyParamName is defined (instead, use default value)
			if(typeof this.wmsParams.proxyParamName !== "undefined")
				this.wmsParams.proxyParamName = 'url';

			// build proxy (es: "proxy.php?url=" )
			_proxy = this.wmsParams.proxy + '?' + this.wmsParams.proxyParamName + '=';

			url = _proxy + encodeURIComponent(url);

		} 

		return url;

	},

	showGetFeatureInfo: function (err, latlng, content) {
		if (err) { console.log(err); return; } // do nothing if there's an error

		// Otherwise show the content in a popup, or something.
		L.popup({ maxWidth: 800})
		.setLatLng(latlng)
		.setContent(content)
		.openOn(this._map);
	}
});

L.tileLayer.betterWms = function (url, options) {
	return new L.TileLayer.BetterWMS(url, options);  
};

L.Control.WMSLegend = L.Control.extend({
	options: {
		position: 'topright',
		uri: ''
	},

	onAdd: function () {
		var controlClassName = 'leaflet-control-wms-legend',
		legendClassName = 'wms-legend',
		stop = L.DomEvent.stopPropagation;
		this.container = L.DomUtil.create('div', controlClassName);
		this.img = L.DomUtil.create('img', legendClassName, this.container);
		this.img.src = this.options.uri;
		this.img.alt = 'Legend';

		L.DomEvent
		.on(this.img, 'click', this._click, this)
		.on(this.container, 'click', this._click, this)
		.on(this.img, 'mousedown', stop)
		.on(this.img, 'dblclick', stop)
		.on(this.img, 'click', L.DomEvent.preventDefault)
		.on(this.img, 'click', stop);
		this.height = null;
		this.width = null;
		return this.container;
	},
	_click: function (e) {
		L.DomEvent.stopPropagation(e);
		L.DomEvent.preventDefault(e);
		// toggle legend visibility
		var style = window.getComputedStyle(this.img);
		if (style.display === 'none') {
			this.container.style.height = this.height + 'px';
			this.container.style.width = this.width + 'px';
			this.img.style.display = this.displayStyle;
		}
		else {
			if (this.width === null && this.height === null) {
				// Only do inside the above check to prevent the container
				// growing on successive uses
				this.height = this.container.offsetHeight;
				this.width = this.container.offsetWidth;
			}
			this.displayStyle = this.img.style.display;
			this.img.style.display = 'none';
			this.container.style.height = '20px';
			this.container.style.width = '20px';
		}
	},
});

L.wmsLegend = function (uri) {
	var wmsLegendControl = new L.Control.WMSLegend;
	wmsLegendControl.options.uri = uri;
	map.addControl(wmsLegendControl);
	return wmsLegendControl;
};


L.wmsLayer = function (uri, options) {
	var layer = new L.tileLayer.wms(uri, options);
	return layer;
};

var hybrid = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		{
			maxZoom : 16,
			attribution : 'Map data &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
			id : 'examples.map-i875mjb7'
		});

var streets = L
.tileLayer(
		'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
		{
			maxZoom : 18,
			attribution : 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
			id : 'examples.map-20v6611k'
		});

var Esri_OceanBasemap = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
		{
			attribution : 'Tiles &copy; ESRI',
			maxZoom : 13
		});

var Esri_WorldImagery = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		{
			attribution : 'Tiles &copy; ESRI'
		});

var ThunderForest1 = L
.tileLayer(
		'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=c4d207cad22c4f65b9adb1adbbaef141',
		{
			attribution : 'Tiles &copy; ThunderForest'
		});

var osmLayer = new L.TileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			maxZoom : 23,
			attribution : 'Map data &copy; OpenStreetMap contributors, CC-BY-SA'
		});


var transasLayer = L.tileLayer(
		'http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4',
		{
			attribution : 'Map data &copy; Transas Nautical Charts',
			maxZoom : 21,
			opacity : 0.7,
			maxNativeZoom : 17,
			tms: true
		});

var densityLayer = L.tileLayer(
		'https://tiles2.marinetraffic.com/ais/density_tiles2015/{z}/{x}/tile_{z}_{x}_{y}.png',
		{
			attribution : 'Map data &copy; MarineTraffic',
			maxZoom : 21,
			opacity : 0.5,
			maxNativeZoom : 10,
			layerVisibility : false
		});

var gmrt = L.tileLayer.wms('https://www.gmrt.org/services/mapserver/wms_merc?service=WMS&version=1.0.0&request=GetMap', {
	layers: 'gmrt',
	attribution: 'GEBCO (multiple sources)'
});

var argos = L.tileLayer.wms('http://www.ifremer.fr/services/wms/coriolis/co_argo_floats_activity?REQUEST=GetMap', {
	layers: 'StationProject',
	format: 'image/png',
	transparent: 'true',
	project: '',
	attribution: 'IFREMER'
});

var sst = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
	layers: 'thetao',
	format: 'image/png',
	styles: 'boxfill/sst_36',
	transparent: 'true',
	colorscalerange: '0,36',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var sssc = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
	layers: 'so',
	format: 'image/png',
	styles: 'boxfill/rainbow',
	transparent: 'true',
	colorscalerange: '30,38',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var ssv = L.TileLayer.BetterWMS('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
	layers: 'sea_water_velocity',
	format: 'image/png',
	styles: 'vector/rainbow',
	transparent: 'true',
	colorscalerange: '0,2',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var zos = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
	layers: 'zos',
	format: 'image/png',
	styles: 'boxfill/rainbow',
	transparent: 'true',
	colorscalerange: '-1,1',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',	
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var chl = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/dataset-oc-glo-chl-multi-l4-oi_4km_daily-rt-v02?REQUEST=GetMap', {
	layers: 'CHL',
	format: 'image/png',
	styles: 'boxfill/alg2',
	transparent: 'true',
	logscale: 'true',
	colorscalerange: '0.01,10.0',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',	
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var waves = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-wav-001-027?REQUEST=GetMap', {
	styles: 'boxfill/rainbow',
	layers:'VHM0',
	colorscalerange:'0.01,8.0',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',	
	transparent: 'true',
	format: 'image/png',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

var wind = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/CERSAT-GLO-BLENDED_WIND_L4-V5-OBS_FULL_TIME_SERIE?REQUEST=GetMap', {
	styles: 'vector/rainbow',
	layers:'wind',
	ELEVATION:'10',
	colorscalerange:'0.0,25.0',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',	
	transparent: 'true',
	format: 'image/png',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'

});

var sss = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
	layers: 'so',
	format: 'image/png',
	styles: 'boxfill/rainbow',
	transparent: 'true',
	colorscalerange: '30,38',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});



function addBaseLayers(layersControl) {

	layersControl.addBaseLayer(Esri_WorldImagery, "ESRI Aerial");
	layersControl.addBaseLayer(osmLayer, "Open Street Maps");
	layersControl.addBaseLayer(hybrid, "Terrain");
	layersControl.addBaseLayer(ThunderForest1, "Outdoors");
	layersControl.addBaseLayer(Esri_OceanBasemap, "ESRI Ocean");
	layersControl.addBaseLayer(gmrt, "GMRT");

	// default base layer
	map.addLayer(Esri_WorldImagery);
}

function addWmsOverlays(layersControl) {
	layers.addOverlay(sss, "CMEMS Water Salinity");
	layers.addOverlay(sst, "CMEMS Water Temperature");
	layers.addOverlay(ssv, "CMEMS Water Velocity");
	layers.addOverlay(zos, "CMEMS Surface Height");
	layers.addOverlay(waves, "CMEMS Waves");
	layers.addOverlay(wind, "CMEMS Wind");
	layers.addOverlay(argos, "Argos Floats");

}

function addTransparentOverlays() {
	layers.addOverlay(transasLayer, "Nautical Charts");
	layers.addOverlay(kmlLayer, "KML Layer");
	layers.addOverlay(shipsOverlay, "AIS Traffic");
	layers.addOverlay(densityLayer, "AIS Density");

	// ships and kml are active by default
	map.addLayer(kmlLayer);
	map.addLayer(shipsOverlay);
}

addBaseLayers(layers);
addWmsOverlays(layers);
addTransparentOverlays(layers);



