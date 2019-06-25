export interface IPotentialCollision {
  asset: string
  ship: string
  distance: number
  timestamp: number
}

export interface IPotentialCollisionPayload {
  asset: string
  ship: string
  distance: number
  timestamp: Date
}
