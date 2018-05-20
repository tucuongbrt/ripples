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

var osmLayer = new L.tileLayer(
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

var ssv = L.tileLayer.wms('http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?REQUEST=GetMap', {
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



