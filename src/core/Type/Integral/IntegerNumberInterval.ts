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
    if (bottom && upper && bottom > upper) {
      return undefined;
    }
    return new IntegerNumberInterval({ bottom, upper });
  }
  public display(): string {
    return `${this.bottom ? "[" : "("}${this.bottom ? this.bottom : "-∞"}, ${
      this.upper ? this.upper : "+∞"
    }${this.upper ? "]" : ")"}`;
  }
}
