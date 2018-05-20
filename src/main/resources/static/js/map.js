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
var layers;
var nameById = {};

var originLat = 31.0, originLng = -130, originZoom = 5, currentLat, currentLng, currentZoom;

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
		layers : [  ],
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
	layers = L.control.layers([], []).addTo(map);
} 
else {
	//alert('PC');
	//L.control.weather().addTo(map);
	layers = L.control.layers([], []).addTo(map);

	//L.control.layers.minimap(baseLayers, overlays).addTo(map);
	var mouse_coordinates = new L.control.coordinates({
		position:"topleft",
		labelTemplateLat:"Lat: {y}",
		labelTemplateLng:"Lng: {x}",
		useLatLngOrder:true
	});
	map.addControl(mouse_coordinates);
	L.control.scale().addTo(map);
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

$.ajaxSetup({
	cache : false
});



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
//every minute(60000 millis = 1 min)
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
