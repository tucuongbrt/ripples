import { interpolateTwoPoints } from './PositionUtils'

describe("interpolate two points", () => {
    it("finds the point between points 1 and 2 using linear interpolation", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: 10, longitude: 10, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: 5, longitude: 5, heading: 45});
    });

    it("finds the correct heading 0", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: 10, longitude: 0, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: 5, longitude: 0, heading: 0});
    });

    it("finds the correct heading 90", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: 0, longitude: 10, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: 0, longitude: 5, heading: 90});
    });

    it("finds the correct heading 180", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: -10, longitude: 0, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: -5, longitude: 0, heading: 180});
    });

    it("finds the correct heading 270", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: 0, longitude: -10, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: 0, longitude: -5, heading: 270});
    });

    it("finds the correct heading 315", () => {
        const point1 = {latitude: 0, longitude: 0, timestamp: 0}
        const point2 = {latitude: -10, longitude: -10, timestamp: 10000}
        const date = 5000
        const result = interpolateTwoPoints(date, point1, point2)
        expect(result).toEqual({latitude: -5, longitude: -5, heading: 315});
    });



});