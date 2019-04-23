import IAisShip from "../model/IAisShip";

const fourHoursInMs = 14400000; 

function isRecent(ship: IAisShip): boolean {
  return ship.timestamp > (Date.now() - fourHoursInMs);
}

export function fetchAisData(): Promise<IAisShip[]> {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/ais`)
    .then(response => response.json())
    .then((ships: IAisShip[]) => {
      ships.forEach(s => s.timestamp = new Date(s.timestamp).getTime())
      return ships.filter(ship => isRecent(ship))
    }); 
};