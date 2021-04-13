export default interface IPollution {
  id?: number
  description: string
  latitude: number
  longitude: number
  timestamp: number
  user: string
}

export default class IPollution implements IPollution {
  constructor(
    public description: string,
    public latitude: number,
    public longitude: number,
    public timestamp: number,
    public user: string
  ) {}
}
