var markers = {};
var ships = {};
var updates = {};
var pois = {};
var plans = {};
var etaMarkers = {};
var tails = {};
var map, marker;
var plotlayers = [];
var shipsOverlay = L.layerGroup([]);
var selectedMarker;
var originLat, originLng, originZoom, currentLat, currentLng, currentZoom;

originLat=31.0;
originLng=-130;
originZoom=5;

var isMobile = {
	Android : function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry : function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS : function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera : function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows : function() {
		return navigator.userAgent.match(/IEMobile/i)
				|| navigator.userAgent.match(/WPDesktop/i);
	},
	any : function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS()
				|| isMobile.Opera() || isMobile.Windows());
	}
};

$.ajaxSetup({
	cache : false
});

function loadPoi() {
	var poi_json = $.getJSON("/poi", function(data) {
		removeMarkers();
		$.each(data, function(i, item) {

			pois[item.description] = item;

			var record = {
				"author" : item.author,
				"description" : item.description,
				"coordinates" : [ item.coordinates[0], item.coordinates[1] ]
			};
			marker = new L.marker([ item.coordinates[0], item.coordinates[1] ],
					{
						title : item.description,
						contextmenu : true,
						contextmenuItems : [ {
							text : 'Edit Marker',
							icon : 'images/edit.png',
							callback : editMarker,
							index : 0
						}, {
							separator : true,
							index : 1
						} ]
					});
			map.addLayer(marker);
			marker.bindPopup(item.description);
			marker.on('mouseover', function(e) {
				this.openPopup();
			});
			marker.on('mouseout', function(e) {
				this.closePopup();
			});
			marker.on('contextmenu', function(e) {
				selectedMarker = e.target.options.title;
			});
			plotlayers.push(marker);
			record = null;
		});
	});
};

function removeMarkers() {
	for (i = 0; i < plotlayers.length; i++) {
		map.removeLayer(plotlayers[i]);
	}
	plotlayers = [];
	pois = {};
}

function showCoordinates(e) {
	var mCoords = new L.marker(e.latlng).bindPopup("Lat: "+e.latlng.lat+" Lng:"+e.latlng.lng).addTo(map).openPopup();
}

function centerMap(e) {
	map.panTo(e.latlng);
	updateCookiePos();
	console.log();
	console.log("cookie data -(centerMap) - Lat: "+$.cookie('savedLat')+" Lng: "+$.cookie('savedLng')+" Zoom: "+$.cookie('savedZoom'));
	alert("From now on, map will be centered here.");
}

function zoomIn(e) {
	map.zoomIn();
}

function zoomOut(e) {
	map.zoomOut();
}

function getCookiePos(){
	$.cookie('savedLat', map.getCenter().lat, { expires: 1 });
	$.cookie('savedLng', map.getCenter().lng, { expires: 1 });
	$.cookie('savedZoom', map.getZoom(), { expires: 1 });
}

function clearCookiePos(){
	$.removeCookie('savedLat');
	$.removeCookie('savedLng');
	$.removeCookie('savedZoom');
}
function updateCookiePos(){
	clearCookiePos();
	getCookiePos();
}

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

if(currentLat==undefined && currentLng==undefined && currentZoom==undefined)
{
	currentLat=$.cookie('savedLat');
	currentLng=$.cookie('savedLng');
	currentZoom=$.cookie('savedZoom');
	
	create_map(currentLat,currentLng,currentZoom);
	
}else{
	create_map(originLat,originLng,originZoom);
}

var kmlLayer = new L.KML("/kml/file.kmz", {
	async : true
});

var SysIcon = L.Icon.extend({
	options : {
		shadowUrl : 'icons/shadow.png',
		iconSize : [ 22, 32 ],
		shadowSize : [ 24, 24 ],
		iconAnchor : [ 11, 32 ],
		shadowAnchor : [ 8, 24 ],
		popupAnchor : [ 0, -32 ]
	}
});

var WptIcon = L.Icon.extend({
	options : {
		shadowUrl : 'icons/shadow.png',
		iconSize : [ 12, 12 ],
		shadowSize : [ 0, 0 ],
		iconAnchor : [ 6, 6 ],
		shadowAnchor : [ 6, 6 ],
		popupAnchor : [ 0, 0 ]
	}
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

//http://nrt.cmems-du.eu/thredds/wms/global-analysis-forecast-phy-001-024?FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=boxfill%2Frainbow&LAYERS=thetao&TIME=2018-05-10T12%253A00%253A00.000Z&ELEVATION=-0.49402499198913574&COLORSCALERANGE=-5.15%2C34.85&NUMCOLORBANDS=20&ABOVEMAXCOLOR=0x000000&BELOWMINCOLOR=0x000000&LOGSCALE=false&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG%3A4326&BBOX=-180,-90,-12.475149147727,77.524850852273&WIDTH=256&HEIGHT=256

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

var baseLayers = {
	"Open Street Map" : osmLayer,
	"Grayscale" : streets,
	"Terrain" : hybrid,
	"Outdoors" : ThunderForest1,
	"ESRI Ocean" : Esri_OceanBasemap,
	"ESRI Aerial" : Esri_WorldImagery,
	"GMRT": gmrt
};

var overlays = {
	"Nautical Charts" : transasLayer,
	"KML Layer": kmlLayer,
	"AIS Traffic": shipsOverlay,
	"AIS Density": densityLayer,
	"CMEMS Water Temperature": sst,
	"CMEMS Water Salinity": sss,
	"CMEMS Water Velocity": ssv,
	"CMEMS Surface Height": zos,
	"CMEMS Chlorophyll": chl,
	"CMEMS Waves": waves,
	"CMEMS Wind": wind,
	"ARGOS Floats": argos
}

map.addLayer(kmlLayer);
//map.addLayer(transasLayer);

function create_map(lat,lng,zoom){
	
	//console.log("create_map - lat: "+lat+" lng: "+lng+" zoom: "+zoom);
	if(lat==undefined && lng==undefined && zoom==undefined)
	{
		lat=originLat;
		lng=originLng;
		zoom=originZoom;
	}
	
	map = L.map('map', {
		center: [lat,lng],
		zoom: zoom,
		zoomSnap: 0.25,
		layers : [ Esri_WorldImagery ],
		contextmenu : true,
		drawControl: true,
		measureControl: true,
		contextmenuWidth : 140,
		contextmenuItems : [ {
			text : 'Show coordinates',
			callback : showCoordinates
		}, {
			text : 'Center map here',
			callback : centerMap
		} ]
	});
}

if (isMobile.any()) {
	//alert('Mobile');
	L.control.layers(baseLayers, overlays).addTo(map);
} 
else {
	//alert('PC');
	//L.control.weather().addTo(map);
	L.control.layers(baseLayers, overlays).addTo(map);
	
	//L.control.layers.minimap(baseLayers, overlays).addTo(map);
	var mouse_coordinates = new L.control.coordinates({
		position:"topleft",
		labelTemplateLat:"Lat: {y}",
		labelTemplateLng:"Lng: {x}",
		useLatLngOrder:true
	});
	map.addControl(mouse_coordinates);
}

var argosIcon = new SysIcon({
	iconUrl : 'icons/ico_argos.png'
});
var uavIcon = new SysIcon({
	iconUrl : 'icons/ico_uav.png'
});
var auvIcon = new SysIcon({
	iconUrl : 'icons/ico_auv.png'
});
var unknownIcon = new SysIcon({
	iconUrl : 'icons/ico_unknown.png'
});
var ccuIcon = new SysIcon({
	iconUrl : 'icons/ico_ccu.png'
});
var spotIcon = new SysIcon({
	iconUrl : 'icons/ico_spot.png'
});
var targetIcon = new SysIcon({
	iconUrl : 'icons/ico_target.png'
});
var desiredIcon = new SysIcon({
	iconUrl : 'icons/ico_desired.png'
});
var extSysIcon = new SysIcon({
	iconUrl : 'icons/ico_external.png'
});
var planeIcon = new SysIcon({
	iconUrl : 'icons/ico_plane.png'
});
var shipIcon = new SysIcon({
	iconUrl : 'icons/ico_ship.png'
});
var usvIcon = new SysIcon({
	iconUrl : 'icons/ico_usv.png'
});

var wptGreen = new WptIcon({
	iconUrl : 'icons/wpt_green.png'
}); 

var wptRed = new WptIcon({
	iconUrl : 'icons/wpt_red.png'
}); 

var wptGray = new WptIcon({
	iconUrl : 'icons/wpt_gray.png'
}); 


L.control.locate({
	keepCurrentZoomLevel : true,
	stopFollowingOnDrag : true,
	icon: 'fa fa-map-marker',  // class for icon, fa-location-arrow or fa-map-marker
    iconLoading: 'fa fa-spinner fa-spin',  // class for loading icon
    metric: true,  // use metric or imperial units
    onLocationError: function(err) {alert(err.message)},  // define an error callback function
    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
            alert(context.options.strings.outsideMapBoundsMsg);
    }
}).addTo(map);

var nameById = {};

listSystems();

function listSystems() {
	$.ajax({
		cache : false,
		url : "api/v1/systems/",
		dataType : "json",
		success : function(data) {
			$.each(data, function(val) {
				nameById[data[val].imcid] = data[val].name;
			});
		}
	});
}

positionHistory();

function updatePositions() {
	$.ajax({
		cache : false,
		url : "api/v1/systems/active",
		dataType : "json",
		success : function(data) {
			$.each(data, function(val) {
				var coords = data[val].coordinates;
				var name = data[val].name;
				var updated = new Date(data[val].updated_at);
				var ic = sysIcon(data[val].imcid);
				var mins = (new Date() - updated) / 1000 / 60;
				var ellapsed = Math.floor(mins) + " mins ago";
				
				if (mins > 120) {
					ellapsed = Math.floor(mins / 60) + " hours ago";
				}
				if (mins > 60 * 24 * 2) {
					ellapsed = Math.floor(mins / 60 / 24) + " days ago";
				}
				if (markers[name] == undefined) {
					updates[name] = updated;
					markers[name] = L.marker(coords, {
						icon : ic
					});
					markers[name].bindPopup("<b>" + name + "</b><br/>"
							+ coords[0].toFixed(6) + ", "
							+ coords[1].toFixed(6) + "<hr/>"
							+ updated.toLocaleString() + "<br/>(" + ellapsed
							+ ")");
					markers[name].addTo(map);
				} else {
					if (updates[name] <= updated) {
						markers[name].setLatLng(new L.LatLng(coords[0],
								coords[1]));
						markers[name].bindPopup("<b>" + name + "</b><br/>"
								+ coords[0].toFixed(6) + ", "
								+ coords[1].toFixed(6) + "<hr/>"
								+ updated.toLocaleString() + "<br/>("
								+ ellapsed + ")");
						updates[name] = updated;
						addToTail(name, coords[0], coords[1]);
					}
				}
			});
		}
	});
}

function positionHistory() {
	$.ajax({
		cache : false,
		url : "positions",
		dataType : "json",
		success : function(data) {
			$.each(data, function(val) {

				var lat = data[val].lat;
				var long = data[val].lon;
				var updated = new Date(data[val].timestamp);
				var imc_id = data[val].imc_id;
				var name = nameById[imc_id];
				addToTail(name, lat, long);

			});
		}
	});
}

function sysIconFromName(name) {
	switch (name.toUpperCase()) {
	case "UUV":
		return auvIcon;
	case "UAV":
		return uavIcon;
	case "CCU":
		return ccuIcon;
	case "USV":
		return usvIcon;
	case "STATICSENSOR":
	case "MOBILESENSOR":
		return spotIcon;
	case "MANNED_SHIP":
		return shipIcon;
	case "MANNED_AIRPLANE":
		return planeIcon;
	case "MANNED_CAR":
	case "UGV":
	case "PERSON":
	default:
		return unknownIcon;
	}
}

function sysIcon(imcId) {
	var sys_selector = 0xE000;
	var vtype_selector = 0x1c00;

	if (imcId >= 0x8401 && imcId <= 0x841a)
		return spotIcon;

	// External System
	if (imcId > 0x0000 + 0xFFFF)
		return extSysIcon;
	
	var sys_type = (imcId & sys_selector) >> 13;

	switch (sys_type) {
	case 0:
	case 1:
		switch ((imcId & vtype_selector) >> 10) {
		case 0:
			return auvIcon;
		case 1:
			return unknownIcon; // rov
		case 2:
			return usvIcon; // asv
		case 3:
			return uavIcon;
		default:
			return unknownIcon; // uxv
		}
	case 2:
		return ccuIcon;
	default:
		return unknownIcon;
		break;
	}
}

function addToShipTail(name, lat, lon) {
	var pos = new L.LatLng(lat, lon);

	if (tails[name] == undefined) {
		tails[name] = L.polyline({});
		tails[name].addTo(shipsOverlay);
	}
	tails[name].addLatLng(pos);
	if (tails[name].getLatLngs().length > 120)
		tails[name].spliceLatLngs(0, 1);	
}

function addToTail(name, lat, lon) {
	var pos = new L.LatLng(lat, lon);

	if (tails[name] == undefined) {
		tails[name] = L.polyline({});
		tails[name].addTo(map);
	}
	tails[name].addLatLng(pos);
	if (tails[name].getLatLngs().length > 120)
		tails[name].spliceLatLngs(0, 1);
}

updatePositions();
// every minute(60000 millis = 1 min)
setInterval(updatePositions, 60000);

var assets = {};
var lastPositions = {};
var ripplesRef = new Firebase('https://neptus.firebaseio.com/');
ripplesRef.child('assets').on('child_changed', updateAsset)
ripplesRef.child('assets').on('value', updateAsset)
ripplesRef.child('assets').on('child_added', updateAsset)
ripplesRef.child('ships').on('child_changed', updateShip);
ripplesRef.child('ships').on('child_added', updateShip);
ripplesRef.child('ships').on('value', updateAsset)

function updateAsset(snapshot) {
	var position = snapshot.val().position;

	if (position == undefined)
	   return;
	
	var name = snapshot.key();
	var type = snapshot.val().type;
	var lat = position.latitude;
	var lon = position.longitude;
	var date = snapshot.val().updated_at;

	if (new Date().getTime() - date > 1000 * 60 * 60)
		return;
	
	var plan = snapshot.val().plan;
	
	if (plan == undefined)
		plans[name] = undefined;
	else {
		if (plan.path != undefined) {
			if (plans[name] == undefined)
				plans[name] = L.polyline({}, {
					color : 'green'
				}).addTo(map);
			else
				plans[name].setLatLngs([]);

			for (point in plan.path) {
				plans[name].addLatLng(L.latLng(plan.path[point]));
			}
		}
		// temporal plan
		if (plan.eta != undefined) {
			if (etaMarkers[name] != undefined) {
				etaMarkers[name].forEach(function(m) {
					map.removeLayer(m);
				});
			}
			etaMarkers[name] = [];
			plan.eta.forEach(function(eta, index) {
				
				if (eta > 0) {
					console.log(eta);
					var point = plan.path[index];
					var time = eta;
					var d = new Date(eta);
					var etaMarker = L.marker(point, {
						icon : wptGreen
					}).bindPopup(name+" ("+(index+1)+")<hr/>"+d.toLocaleString());
					etaMarkers[name].push(etaMarker);
					etaMarker.addTo(map);
				}
			});
		}
	}

	addToTail(name, lat, lon);
	var pos = new L.LatLng(lat, lon);

	if (markers[name] != undefined) {
		markers[name].setLatLng(pos);
		markers[name].setIcon(sysIconFromName(type));
		markers[name].bindPopup("<b>" + name + "</b><br/>"
				+ lat.toFixed(6) + ", " + lon.toFixed(6) + "<hr/>"
				+ new Date(date).toLocaleString());
		if ("Gunnerus" === name)
			markers[name].setIcon(targetIcon);
	} else {
		markers[name] = L.marker([ lat, lon ], {
			icon : sysIconFromName(type)
		}).bindPopup(
				"<b>" + name + "</b><br/>" + lat.toFixed(6) + ", "
						+ lon.toFixed(6) + "<hr/>"
						+ new Date(date).toLocaleString());
		markers[name].addTo(map);
	}
}

function updateShip(snapshot) {

	if (!snapshot.val().position) {
		return;
	}

	var position = snapshot.val().position;
	var name = snapshot.key();
	var type = snapshot.val().type;
	var lat = position.latitude;
	var lon = position.longitude;
	var speed = position.speed * 0.51444444444;
	var mmsi = position.mmsi;
	var heading = position.heading * Math.PI / 180.0;
	var cog = position.cog * Math.PI / 180.0;
	if (position.heading > 360)
		heading = cog;
	var date = snapshot.val().updated_at;
	var fillColor = '#0000ff';

	switch (type) {
		case 'Fishing':
		case '30':
			type = 'Fishing';
			fillColor = '#0fff00';
			break;
		case 'CargoHazardousA':
		case 'CargoHazardousB':
		case 'CargoHazardousC':
		case '80':
			type = 'Hazardous Cargo';
			fillColor = '#ff0000';
			break;
		case '75':
		case '76':
		case '77':
		case '78':
		case '79':
			type = 'Cargo';
			fillColor = '#ffcccc';
			break;
		case 'Tug':			
			fillColor = '#ffff00';
			break;
		case 'Tanker':			
			fillColor = '#cc9900';
			break;
		default:
			fillColor = '#cccccc';
			break;
	}

	if (new Date().getTime() - date > 1000 * 60 * 20)
		return;
		
	addToShipTail(name, lat, lon);

	var pos = new L.LatLng(lat, lon);

	if (ships[name] != undefined) {
		ships[name].setLatLng(pos);
		ships[name].setCourse(cog);
		ships[name].setHeading(heading);
		ships[name].setSpeed(speed);
	}
	else {
		ships[name] = L.trackSymbol(pos, {
			icon : shipIcon,
			fill: true,
    		fillColor: fillColor,
    		fillOpacity: 0.7,
    		stroke: true,
    		color: '#000000',
   			opacity: 1.0,
   			weight: 1.0,
    		speed: speed,
    		course: cog,
			heading: heading,
			speed: speed
		});
		ships[name].addTo(shipsOverlay);
	}

	

	ships[name].bindPopup("<b>" + name + "</b><hr/>"
		+ type+ "<br/>"
		+ lat.toFixed(6) + ", " + lon.toFixed(6) + "<br/>"
		+ speed.toFixed(1)+ " m/s<br/>"
		+ "<a href=\"https://www.marinetraffic.com/en/ais/details/ships/mmsi:"+mmsi+"\" target=\"_blank\">more info</a><hr/>"
		+ new Date().toLocaleString());			
}

