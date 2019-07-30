export interface ILogbook {
  name: string
  creationDate: number
}

export default class MyLogbook implements ILogbook {
  constructor(public name: string, public creationDate: number) {}
}
