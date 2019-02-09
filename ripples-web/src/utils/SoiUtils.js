const apiURL = process.env.REACT_APP_API_URL

export function fetchSoiData() {
  return fetch(`${apiURL}/soi`)
    .then(response => response.json())
    .then((data) => {
      let vehicles = [];
      let spots = [];
      data.forEach(system => {
        if (system.name.startsWith('spot')) {
          spots.push(system)
        } else {
          const waypoints = system.plan.waypoints;
          if (waypoints[waypoints.length - 1].eta*1000 > Date.now()){
            vehicles.push(system)
          }
        }
      })
      return { vehicles: vehicles, spots: spots };
    });
}

export function fetchProfileData(){
  return fetch(`${apiURL}/soi/profiles`)
    .then(response => response.json())
    .then((data) => {
      console.log('profile data:', data)
      return data;
    })
}