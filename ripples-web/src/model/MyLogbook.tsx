import IAnnotation from "./IAnnotations";

export interface ILogbook {
  name: string
  date: number
  annotations: IAnnotation[]
}

export default class MyLogbook implements ILogbook {
  constructor(public name: string, public date: number, public annotations: IAnnotation[] = []) {}
}
