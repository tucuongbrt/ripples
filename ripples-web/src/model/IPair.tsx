export default interface IPair<T> {
  first: T
  second: T
}

export class Pair<T> implements IPair<T> {
  public first: T
  public second: T

  constructor(f: T, s: T) {
    this.first = f
    this.second = s
  }
}
