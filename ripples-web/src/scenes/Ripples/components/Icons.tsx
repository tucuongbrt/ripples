import L from 'leaflet'
import lauv_orange from '../../../assets/LAUV_orange.png'
import lauv_yellow from '../../../assets/LAUV_yellow.png'
import lauv_red from '../../../assets/LAUV_red.png'
import av_generic from '../../../assets/AV_generic.png'
import manta from '../../../assets/manta.png'
import ais_red from '../../../assets/AIS_red.png'
import ais_purple from '../../../assets/AIS_purple.png'
import ais_grey from '../../../assets/AIS_grey.png'
import wavy_basic from '../../../assets/wavy_basic.png'
import wavy_littoral from '../../../assets/wavy_littoral.png'
import wavy_ocean from '../../../assets/wavy_ocean.png'
import wavy_dummy from '../../../assets/wavy_dummy.png'
import circle_blue from '../../../assets/circle_blue.png'
import circle_green from '../../../assets/circle_green.png'
import circle_red from '../../../assets/circle_red.png'
import circle_orange from '../../../assets/circle_orange.png'
import circle_yellow from '../../../assets/circle_yellow.png'
import desktop from '../../../assets/desktop.png'
import mobile from '../../../assets/mobile.png'
import wp from '../../../assets/wp.png'
import wp_start from '../../../assets/wp_start.png'
import wp_finish from '../../../assets/wp_finish.png'
import pin_empty from '../../../assets/pin_empty.png'
import temperature from '../../../assets/temperature.png'

export const BlueCircleIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: circle_blue,
  },
})

export const PCIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: desktop,
  },
})

export const MobileIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: mobile,
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

export const AuvYellowIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: lauv_yellow,
  },
})

export const AuvYellowSmallIcon = L.Icon.extend({
  options: {
    iconSize: [22, 22],
    iconUrl: lauv_yellow,
  },
})

export const AuvRedIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconUrl: lauv_red,
  },
})

export const AuvRedSmallIcon = L.Icon.extend({
  options: {
    iconSize: [22, 22],
    iconUrl: lauv_red,
  },
})

export const AvGenericIcon = L.Icon.extend({
  options: {
    iconSize: [22, 22],
    iconUrl: av_generic,
  },
})

export const AvGenericSmallIcon = L.Icon.extend({
  options: {
    iconSize: [17, 17],
    iconUrl: av_generic,
  },
})

export const mantaIcon = L.Icon.extend({
  options: {
    iconSize: [20, 20],
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
    iconSize: [10, 10],
    iconUrl: wp_start,
  },
})

export const WaypointIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: wp,
  },
})

export const RedCircleIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: circle_red,
  },
})

export const RedCircleSmalIcon = L.Icon.extend({
  options: {
    iconSize: [5, 5],
    iconUrl: circle_red,
  },
})

export const GreenCircleIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: circle_green,
  },
})

export const YellowCircleIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: circle_yellow,
  },
})

export const OrangeCircleIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: circle_orange,
  },
})

export const FinishWaypointIcon = L.Icon.extend({
  options: {
    iconSize: [10, 10],
    iconUrl: wp_finish,
  },
})

export const SpotIcon = L.Icon.extend({
  options: {
    iconSize: [25, 25],
    iconUrl: pin_empty,
  },
})

export const CCUIcon = L.Icon.extend({
  options: {
    iconSize: [25, 25],
    iconUrl: pin_empty,
  },
})

export const SensorIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconUrl: temperature,
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

export const AISPurpleIcon = L.Icon.extend({
  options: {
    iconSize: [17, 17],
    iconUrl: ais_purple,
  },
})

export const AISPurpleSmallIcon = L.Icon.extend({
  options: {
    iconSize: [12, 12],
    iconUrl: ais_purple,
  },
})

export const GeoJsonMarker = L.Icon.extend({
  options: {
    iconSize: [5, 5],
    iconUrl: circle_yellow,
  },
})

export const WavyBasicIcon = L.Icon.extend({
  options: {
    iconSize: [15, 15],
    iconUrl: wavy_basic,
  },
})

export const WavyLittoralIcon = L.Icon.extend({
  options: {
    iconSize: [15, 15],
    iconUrl: wavy_littoral,
  },
})

export const WavyOceanIcon = L.Icon.extend({
  options: {
    iconSize: [15, 15],
    iconUrl: wavy_ocean,
  },
})

export const WavyDummyIcon = L.Icon.extend({
  options: {
    iconSize: [15, 15],
    iconUrl: wavy_dummy,
  },
})
