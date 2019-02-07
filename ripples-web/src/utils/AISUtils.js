export function fetchAisData() {
  return fetch(`${process.env.REACT_APP_API_URL}/ais`)
    .then(response => response.json())
    .then(ships => {
        return ships;
    }) 
};