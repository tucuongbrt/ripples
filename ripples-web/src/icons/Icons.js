import L from 'leaflet'

export const AuvIcon = L.Icon.extend({
    options: {
		iconUrl: 'https://image.flaticon.com/icons/png/128/190/190006.png',
		//iconUrl: './src/icons/ico_auv.png',
        iconSize: [32, 32]
    }
});

export const GhostIcon = L.Icon.extend({
    options: {
		iconUrl: 'http://files.softicons.com/download/holidays-icons/halloween-icons-by-arrioch/ico/ghost.ico',
		//iconUrl: './src/icons/ico_auv.png',
        iconSize: [32, 32]
    }
});

export const WaypointIcon = L.Icon.extend({
    options: {
        iconUrl: 'http://icons.iconarchive.com/icons/hopstarter/scrap/256/Aqua-Ball-Green-icon.png',
        iconSize: [16, 16]
    }
})

export const SpotIcon = L.Icon.extend({
    options: {
        iconUrl: 'https://cdn4.iconfinder.com/data/icons/holiday-and-have-fun/32/place_spot_target_location-128.png',
        iconSize: [32, 32]
    }
})

export const SensorIcon = L.Icon.extend({
    options: {
        iconUrl: 'http://icons.iconarchive.com/icons/google/noto-emoji-travel-places/256/42650-thermometer-icon.png',
        iconSize: [32, 32]
    }
})