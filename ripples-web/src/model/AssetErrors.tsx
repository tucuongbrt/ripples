

export class AssetError {
    constructor(public timestamp: number, public message: string) {}
}


export class AssetErrors {
    constructor(private name: string, private errors: AssetError[]) {}
    getName() { return this.name}
    getErrors() {return this.errors}
}