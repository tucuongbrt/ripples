import IAnnotation from './IAnnotations'

export interface ILogbook {
  name: string
  creationDate: number
  annotations: IAnnotation[]
}

export default class MyLogbook implements ILogbook {
  constructor(public name: string, public creationDate: number, public annotations: IAnnotation[] = []) {}
}
