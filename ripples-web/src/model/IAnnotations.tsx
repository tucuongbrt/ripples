import ILatLng from './ILatLng'

export default interface IAnnotation extends INewAnnotation {
  id: number
  username: string
  date: number
}

export interface INewAnnotation extends ILatLng {
  content: string
}

export class Annotation implements IAnnotation {
  constructor(
    public id: number,
    public content: string,
    public username: string,
    public date: number,
    public latitude: number,
    public longitude: number
  ) {}
}

export class NewAnnotation implements INewAnnotation {
  public latitude: number
  public longitude: number
  constructor(public content: string, location: ILatLng) {
    this.latitude = location.latitude
    this.longitude = location.longitude
  }
}
