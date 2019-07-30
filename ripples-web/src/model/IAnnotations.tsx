export default interface IAnnotation {
  id: number
  content: string
  username: string
  date: Date
}

export class Annotation implements IAnnotation {
  constructor(public id: number, public content: string, public username: string, public date: Date) {}
}
