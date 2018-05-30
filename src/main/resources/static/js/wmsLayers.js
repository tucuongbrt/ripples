var mapLayers = {};

L.TileLayer.WMSLegend = L.TileLayer.WMS.extend({
	
	getLegendUrl: function(url, options) {
		var params = [];
		
		for (var i in options) {
			params.push(encodeURIComponent(i.toUpperCase()) + '=' + encodeURIComponent(options[i]));
		}
		params.push('REQUEST=GetLegendGraphic');
		params.push('LAYER='+encodeURIComponent(options['layers']));
		return url +((!url || url.indexOf('?') === -1) ? '?' : '&') + params.join('&');		
	},
	
	initialize: function(url, options) {
		
		L.TileLayer.WMS.prototype.initialize.call(this, url, options);
		this._legendUrl = this.getLegendUrl(url, options);										
    },
    onAdd: function(map) {
    	L.TileLayer.WMS.prototype.onAdd.call(this, map);
    	
    	if (this._legendUrl) {
    		var legendUrl = this._legendUrl;
        	this._legend = L.control({
    		    position: 'bottomright'		    	
    		});
    		
    		this._legend.onAdd = function(map) {
    		    var src = legendUrl;
    		    var div = L.DomUtil.create('div', 'info legend');
    		    div.innerHTML +=
    		        '<img src="' + src + '" alt="legend" width="80" wight="100">';
    		    return div;
    		};
    		
    		this._legend.addTo(map);
    	}
    },
    onRemove: function(map) {
    	L.TileLayer.WMS.prototype.onRemove.call(this, map);
    	if (this._legendUrl) {
    		map.removeControl(this._legend);	
    	}    	
    }
});

L.tileLayer.wmsLegend = function(url, options) {
	return new L.TileLayer.WMSLegend(url, options);
}


mapLayers.hybrid = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		{
			maxZoom : 16,
			attribution : 'Map data &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
			id : 'examples.map-i875mjb7'
		});

mapLayers.shipsOverlay = L.layerGroup([]);

mapLayers.streets = L
.tileLayer(
		'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
		{
			maxZoom : 18,
			attribution : 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
			id : 'examples.map-20v6611k'
		});

mapLayers.Esri_OceanBasemap = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
		{
			attribution : 'Tiles &copy; ESRI',
			maxZoom : 13
		});

mapLayers.Esri_WorldImagery = L
.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		{
			attribution : 'Tiles &copy; ESRI'
		});

mapLayers.ThunderForest1 = L
.tileLayer(
		'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=c4d207cad22c4f65b9adb1adbbaef141',
		{
			attribution : 'Tiles &copy; ThunderForest'
		});

mapLayers.osmLayer = new L.tileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			maxZoom : 23,
			attribution : 'Map data &copy; OpenStreetMap contributors, CC-BY-SA'
		});


mapLayers.transasLayer = L.tileLayer(
		'http://wms.transas.com/TMS/1.0.0/TX97-transp/{z}/{x}/{y}.png?token=9e53bcb2-01d0-46cb-8aff-512e681185a4',
		{
			attribution : 'Map data &copy; Transas Nautical Charts',
			maxZoom : 21,
			opacity : 0.7,
			maxNativeZoom : 17,
			tms: true
		});

mapLayers.densityLayer = L.tileLayer(
		'https://tiles2.marinetraffic.com/ais/density_tiles2015/{z}/{x}/tile_{z}_{x}_{y}.png',
		{
			attribution : 'Map data &copy; MarineTraffic',
			maxZoom : 21,
			opacity : 0.5,
			maxNativeZoom : 10,
			layerVisibility : false
		});

mapLayers.gmrt = L.tileLayer.wms('https://www.gmrt.org/services/mapserver/wms_merc?service=WMS&version=1.0.0&request=GetMap', {
	layers: 'gmrt',
	attribution: 'GEBCO (multiple sources)'
});

mapLayers.argos = L.tileLayer.wms('http://www.ifremer.fr/services/wms/coriolis/co_argo_floats_activity', {
	layers: 'StationProject',
	format: 'image/png',
	transparent: 'true',
	project: '',
	attribution: 'IFREMER'
});

mapLayers.sst = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024', {
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

mapLayers.sssc = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024', {
	layers: 'so',
	format: 'image/png',
	styles: 'boxfill/rainbow',
	transparent: 'true',
	colorscalerange: '33,36',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	attribution : 'E.U. Copernicus Marine Service Information'
});

mapLayers.ssv = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024', {
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

mapLayers.zos = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024', {
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

mapLayers.chl = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/dataset-oc-glo-chl-multi-l4-oi_4km_daily-rt-v02', {
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

mapLayers.waves = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-wav-001-027', {
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

mapLayers.wind = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/CERSAT-GLO-BLENDED_WIND_L4-V5-OBS_FULL_TIME_SERIE', {
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

mapLayers.sss = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024', {
	layers: 'so',
	format: 'image/png',
	styles: 'boxfill/rainbow',
	transparent: 'true',
	colorscalerange: '33,36',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	opacity: '0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});

mapLayers.sla = L.tileLayer.wmsLegend('http://nrt.cmems-du.eu/thredds/wms/dataset-duacs-nrt-global-merged-allsat-phy-l4', {
	layers: 'ugosa',
	format: 'image/png',
	transparent: 'true',
	styles: 'boxfill/redblue',
	colorscalerange: '-0.8,0.8',
	belowmincolor: 'extend',
	belowmaxcolor: 'extend',
	opacity:'0.8',
	attribution : 'E.U. Copernicus Marine Service Information'
});	
	
mapLayers.kmlLayer = new L.KML("/kml/file.kmz", {
	async : true
});

mapLayers.mur = new L.GIBSLayer('GHRSST_L4_MUR_Sea_Surface_Temperature', {
    date: new Date('2018/05/25'),
    transparent: false
});


function addBaseLayers(layersControl) {

	layersControl.addBaseLayer(mapLayers.Esri_WorldImagery, "ESRI Aerial");
	layersControl.addBaseLayer(mapLayers.osmLayer, "Open Street Maps");
	layersControl.addBaseLayer(mapLayers.hybrid, "Terrain");
	layersControl.addBaseLayer(mapLayers.ThunderForest1, "Outdoors");
	layersControl.addBaseLayer(mapLayers.Esri_OceanBasemap, "ESRI Ocean");
	layersControl.addBaseLayer(mapLayers.gmrt, "GMRT");

	// default base layer
	map.addLayer(mapLayers.Esri_WorldImagery);
}

function addWmsOverlays(layersControl) {
	layers.addOverlay(mapLayers.sss, "CMEMS Water Salinity");
	layers.addOverlay(mapLayers.sst, "CMEMS Water Temperature");
	layers.addOverlay(mapLayers.ssv, "CMEMS Water Velocity");
	layers.addOverlay(mapLayers.zos, "CMEMS Surface Height");
	layers.addOverlay(mapLayers.chl, "CMEMS Chlorophyll");
	layers.addOverlay(mapLayers.sla, "CMEMS Sea Level Anomaly");
	
	layers.addOverlay(mapLayers.waves, "CMEMS Waves");
	layers.addOverlay(mapLayers.wind, "CMEMS Wind");
	layers.addOverlay(mapLayers.argos, "Argos Floats");
	layers.addOverlay(mapLayers.mur, "MUR Surface Temperature");
	
}

function addTransparentOverlays() {
	layers.addOverlay(mapLayers.transasLayer, "Nautical Charts");
	layers.addOverlay(mapLayers.kmlLayer, "KML Layer");
	layers.addOverlay(mapLayers.shipsOverlay, "AIS Traffic");
	layers.addOverlay(mapLayers.densityLayer, "AIS Density");

	// ships and kml are active by default
	map.addLayer(mapLayers.kmlLayer);
	map.addLayer(mapLayers.shipsOverlay);
}

addBaseLayers(layers);
addWmsOverlays(layers);
addTransparentOverlays(layers);



