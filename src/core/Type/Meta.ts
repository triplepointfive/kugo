export interface IMetaType {
  // This is a union of multiple types
  options: BaseType[];
}

export abstract class BaseType {
  public abstract display(): string;
}

export abstract class NumberType extends BaseType {}

export class IntegerNumberType extends NumberType {
  constructor(public readonly bounds: IntegerNumberInterval[] = []) {
    super();
  }

  public merge({ bounds }: IntegerNumberType): IntegerNumberType {
    const resultSet: IntegerNumberInterval[] = [];

    this.bounds.forEach((interval1) => {
      bounds.forEach((interval2) => {
        const intersection = interval1.intersection(interval2);
        if (intersection) {
          resultSet.push(intersection);
        }
      });
    });

    // TODO: Add normalization
    return new IntegerNumberType(resultSet);
  }

  public display(): string {
    if (this.bounds.length === 0) {
      return "Z";
    }

    return this.bounds.map((b) => b.display()).join(" ∪ ");
  }
}

export class NaturalNumberType extends IntegerNumberType {
  constructor() {
    super([new IntegerNumberInterval({ bottom: 1 })]);
  }

  public display(): string {
    return "N";
  }
}

export class Natural0NumberType extends IntegerNumberType {
  constructor() {
    super([new IntegerNumberInterval({ bottom: 0 })]);
  }

  public display(): string {
    return "N0";
  }
}

export class IntegerNumberInterval {
  public readonly bottom?: number;
  public readonly upper?: number;

  constructor({ bottom, upper }: { bottom?: number; upper?: number } = {}) {
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
