import L from 'leaflet'
import lauv_orange from '../../../assets/LAUV_orange.png'
import manta from '../../../assets/manta.png'
import ais_red from '../../../assets/AIS_red.png'
import ais_grey from '../../../assets/AIS_grey.png'

export const BlueCircleIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://i.imgur.com/iiHo3vX.png',
  },
})

export const PCIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://www.freeiconspng.com/uploads/pc-icon-26.png',
  },
})

export const MobileIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://www.freeiconspng.com/uploads/image--mobile-icon--risk-of-rain-wiki--wikia-3.png',
  },
})

export const GhostIcon = L.Icon.extend({
  options: {
    iconSize: [24, 24],
    iconUrl: 'https://png.pngtree.com/svg/20170817/ghost_1327317.png',
  },
})

export const AuvIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: 'https://image.flaticon.com/icons/png/128/190/190006.png',
  },
})

export const AuvOrangeIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: lauv_orange,
  },
})

export const AuvOrangeSmallIcon = L.Icon.extend({
  options: {
    iconSize: [22, 22],
    iconUrl: lauv_orange,
  },
})

export const mantaIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: manta,
  },
})

export const GreenTriangleIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://i.imgur.com/HCNwjyG.png',
  },
})

export const YellowTriangleIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://i.imgur.com/F2VhR2Q.png',
  },
})

export const RedTriangleIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://i.imgur.com/hqIGg6n.png',
  },
})

export const StartWaypointIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'http://icons.iconarchive.com/icons/hopstarter/scrap/256/Aqua-Ball-Green-icon.png',
  },
})

export const WaypointIcon = L.Icon.extend({
  options: {
    iconSize: [18, 18],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Blue_sphere.svg',
  },
})

export const RedCircleIcon = L.Icon.extend({
  options: {
    iconSize: [18, 18],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Nuvola_apps_krec.svg',
  },
})

export const GreenCircleIcon = L.Icon.extend({
  options: {
    iconSize: [18, 18],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Green_sphere.svg',
  },
})

export const YellowCircleIcon = L.Icon.extend({
  options: {
    iconSize: [18, 18],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Nuvola_apps_kbouncey.svg',
  },
})

export const OrangeCircleIcon = L.Icon.extend({
  options: {
    iconSize: [18, 18],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Orange_sphere.png',
  },
})

export const FinishWaypointIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://icons.iconarchive.com/icons/hopstarter/scrap/256/Aqua-Ball-Red-icon.png',
  },
})

export const SpotIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: 'https://cdn4.iconfinder.com/data/icons/holiday-and-have-fun/32/place_spot_target_location-128.png',
  },
})

export const CCUIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: 'https://cdn4.iconfinder.com/data/icons/holiday-and-have-fun/32/place_spot_target_location-128.png',
  },
})

export const SensorIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: 'https://image.flaticon.com/icons/svg/134/134125.svg',
  },
})

export const AwarenessIcon = L.Icon.extend({
  options: {
    iconSize: [20, 20],
    iconUrl: 'https://image.flaticon.com/icons/svg/25/25678.svg',
  },
})

export const AISGreyIcon = L.Icon.extend({
  options: {
    iconSize: [17, 17],
    iconUrl: ais_grey,
  },
})

export const AISGreySmallIcon = L.Icon.extend({
  options: {
    iconSize: [12, 12],
    iconUrl: ais_grey,
  },
})

export const AISRedIcon = L.Icon.extend({
  options: {
    iconSize: [17, 17],
    iconUrl: ais_red,
  },
})

export const AISRedSmallIcon = L.Icon.extend({
  options: {
    iconSize: [12, 12],
    iconUrl: ais_red,
  },
})

export const GeoJsonMarker = L.Icon.extend({
  options: {
    iconSize: [5, 5],
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Eo_circle_yellow_blank.svg',
  },
})
