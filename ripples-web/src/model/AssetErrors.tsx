export class AssetError {
  constructor(public timestamp: number, public message: string) {}
}

export class AssetErrors {
  constructor(private name: string, private errors: AssetError[]) {}
  public getName() {
    return this.name
  }
  public getErrors() {
    return this.errors
  }
}
