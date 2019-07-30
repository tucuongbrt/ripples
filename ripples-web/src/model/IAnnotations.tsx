import ILatLng from './ILatLng'

export default interface IAnnotation extends INewAnnotation {
  id: number
  username: string
  date: Date
}

export interface INewAnnotation {
  content: string
  location: ILatLng
}

export class Annotation implements IAnnotation {
  constructor(
    public id: number,
    public content: string,
    public username: string,
    public date: Date,
    public location: ILatLng
  ) {}
}

export class NewAnnotation implements INewAnnotation {
  constructor(public content: string, public location: ILatLng) {}
}
