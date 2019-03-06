/**
 * Calculate the position of an asset at a time, given his timeline of points
 */
export function calculateAssetPosisition(time, timeline) {
    // get the previous and next positions
    const prevIndex = timeline.find((assetPos,i) => {
        return assetPos.eta <= time && timeline[i+1].eta > time
    })
    const prevPoint = timeline[prevIndex]
    const nextPoint = timeline[prevIndex+1]
    
    // interpolate
    const ratioCompleted = (time - prevPoint.eta)/(nextPoint.eta - prevPoint.eta)
    const latDelta = nextPoint.latitude - prevPoint.latitude
    const lngDelta = nextPoint.longitude - prevPoint.longitude
    const totalDelta = Math.sqrt(Math.pow(latDelta, 2) + Math.pow(lngDelta, 2))
    return {
        latitude: prevPoint.latitude + ratioCompleted * latDelta,
        longitude: prevPoint.longitude + ratioCompleted + lngDelta,
        heading: Math.acos((nextPoint.latitude - prevPoint.latitude)/ totalDelta)
    }

}