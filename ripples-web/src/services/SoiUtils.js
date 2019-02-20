const apiURL = process.env.REACT_APP_API_URL

export async function fetchSoiData() {
  const response = await fetch(`${apiURL}/soi`);
  const data = await response.json();
  let vehicles = [];
  let spots = [];
  data.forEach(system => {
    if (system.name.startsWith('spot')) {
      spots.push(system);
    }
    else {
      const waypoints = system.plan.waypoints;
      if (waypoints[waypoints.length - 1].eta * 1000 > Date.now()) {
        vehicles.push(system);
      }
    }
  });
  return { vehicles: vehicles, spots: spots };
}

export async function fetchProfileData() {
  const response = await fetch(`${apiURL}/soi/profiles`);
  const data = await response.json();
  console.log('profile data:', data);
  return data;
}

export async function postNewPlan(vehicleName, newPlan) {
  console.log("Called post new plan")
  const response = await fetch(`${apiURL}/soi`, {
    method: "POST",
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify({ vehicleName: vehicleName, plan: newPlan }),
  });
  return await Promise.all([response.ok, response.json()]);
}