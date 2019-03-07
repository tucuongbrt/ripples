import IPositionAtTime from "./IPositionAtTime";

export default interface ISoiAwareness {
    name: string // vehicle name
    positions: IPositionAtTime[]
}