export class Identifier {
  constructor(private value: string) {
    this.value = value;
  }

  equals(id?: Identifier): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof this.constructor)) {
      return false;
    }
    return id.toValue() === this.value;
  }

  public toString() {
    return this.value;
  }

  /**
   * Return raw value of identifier
   */

  public toValue() {
    return this.value;
  }
}
