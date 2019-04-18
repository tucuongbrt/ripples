import IAisShip from "../model/IAisShip";

const fourHoursInMs = 14400000; 

function isRecent(ship: IAisShip): boolean {
  return ship.updated_at > (Date.now() - fourHoursInMs);
}

export function fetchAisData() {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/ais`)
    .then(response => response.json())
    .then((ships: IAisShip[]) => ships.filter(ship => isRecent(ship))); 
};