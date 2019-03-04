export class IntegerNumberInterval {
  public readonly bottom?: number;
  public readonly upper?: number;

  constructor({
    bottom,
    upper,
  }: {
    bottom?: number;
    upper?: number;
  } = {}) {
    this.bottom = bottom;
    this.upper = upper;
  }

  public intersection(
    interval: IntegerNumberInterval,
  ): IntegerNumberInterval | undefined {
    const bottom =
      this.bottom && interval.bottom
        ? Math.max(this.bottom, interval.bottom)
        : this.bottom || interval.bottom;
    const upper =
      this.upper && interval.upper
        ? Math.min(this.upper, interval.upper)
        : this.upper || interval.upper;
    if (bottom !== undefined && upper !== undefined && bottom > upper) {
      return undefined;
    }
    return new IntegerNumberInterval({ bottom, upper });
  }

  public display(): string {
    if (this.bottom !== undefined && this.bottom === this.upper) {
      return `${this.bottom}`;
    }

    return `${this.bottom !== undefined ? "[" : "("}${
      this.bottom !== undefined ? this.bottom : "-∞"
    }, ${this.upper !== undefined ? this.upper : "+∞"}${
      this.upper !== undefined ? "]" : ")"
    }`;
  }
}
