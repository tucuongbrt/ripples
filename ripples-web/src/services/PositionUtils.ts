function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function distanceInKmBetweenCoords(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

export function interpolateTwoPoints(date, prevPoint, nextPoint) {
    const ratioCompleted = (date - prevPoint.timestamp)/(nextPoint.timestamp - prevPoint.timestamp)
    const latDelta = nextPoint.latitude - prevPoint.latitude
    const lngDelta = nextPoint.longitude - prevPoint.longitude
    const totalDelta = Math.sqrt(Math.pow(latDelta, 2) + Math.pow(lngDelta, 2))
    const cosAlpha = latDelta / totalDelta;
    let heading = Math.round(Math.acos(cosAlpha) * 180 / Math.PI)
    if (lngDelta < 0) heading += 180
    return {
        latitude: prevPoint.latitude + ratioCompleted * latDelta,
        longitude: prevPoint.longitude + ratioCompleted * lngDelta,
        heading: heading
    }
}

export function getPrevAndNextPoints(points, date){
    const prevIndex = points.findIndex((wp,i) => wp.timestamp < date && points[i+1].timestamp > date)
    return {prev: points[prevIndex], next: points[prevIndex+1]}
}

export function getLatLng(position){
    return {lat: position.latitude, lng: position.longitude}
}
