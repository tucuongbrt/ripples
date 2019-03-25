import IAisShip from "../model/IAisShip";

export function fetchAisData() {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/ais`)
    .then(response => response.json())
    .then((ships: IAisShip[]) => ships) 
};