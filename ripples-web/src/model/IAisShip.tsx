export default interface IAisShip {
    name: String
    mmsi: String
    latitude: number
    longitude: number
    cog: number
    sog: number
    heading: number
    type: String
    updated_at: number
}