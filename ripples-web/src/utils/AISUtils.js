const apiURL = 'http://localhost:9090'

export function fetchAisData() {
  return fetch(`${apiURL}/ais`)
    .then(response => response.json())
    .then(ships => {
        return ships;
    }) 
};