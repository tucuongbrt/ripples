import IAisShip from "../model/IAisShip";

const oneHourInMs = 3600000; 

function isRecent(ship: IAisShip): boolean {
  return ship.timestamp > (Date.now() - oneHourInMs);
}
export async function fetchAisData(): Promise<IAisShip[]> {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ais`);
  const ships = await response.json();
  ships.forEach((s: IAisShip) => s.timestamp = new Date(s.timestamp).getTime());
  return ships.filter((s: IAisShip) => isRecent(s)); 
};