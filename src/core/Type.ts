export type INumberBound =
  | { readonly type: "inclusive" | "exclusive"; readonly value: number }
  | { readonly type: "infinity" };

export interface INumberInterval {
  readonly bottom: INumberBound;
  readonly upper: INumberBound;
}

// Min is only affecting positive infinity
const min = (a: INumberBound, b: INumberBound): INumberBound => {
  if (a.type === "infinity") {
    return b;
  }

  if (b.type === "infinity") {
    return a;
  }

  if (a.value === b.value) {
    return {
      type:
        a.type === "exclusive" || b.type === "exclusive"
          ? "exclusive"
          : "inclusive",
      value: a.value,
    };
  }

  if (a.value < b.value) {
    return a;
  } else {
    return b;
  }
};

// Max is only affecting negative infinity
const max = (a: INumberBound, b: INumberBound): INumberBound => {
  if (a.type === "infinity") {
    return b;
  }

  if (b.type === "infinity") {
    return a;
  }

  if (a.value === b.value) {
    return {
      type:
        a.type === "exclusive" && b.type === "exclusive"
          ? "exclusive"
          : "inclusive",
      value: a.value,
    };
  }

  if (a.value > b.value) {
    return a;
  } else {
    return b;
  }
};

export class NumberInterval implements INumberInterval {
  constructor(
    public readonly bottom: INumberBound,
    public readonly upper: INumberBound,
  ) { }

  public get isUniversal(): boolean {
    return this.negativeInf && this.positiveInf;
  }

  public get negativeInf(): boolean {
    return this.bottom.type === "infinity";
  }

  public get positiveInf(): boolean {
    return this.upper.type === "infinity";
  }

  public intersection(interval: INumberInterval): NumberInterval | undefined {
    const a = max(this.bottom, interval.bottom);
    const b = min(this.upper, interval.upper);

    if (a.type !== "infinity" && b.type !== "infinity") {
      if (a.value > b.value) {
        return undefined;
      } else if (
        a.value === b.value &&
        (a.type === "exclusive" || b.type === "exclusive")
      ) {
        return undefined;
      }
    }

    return new NumberInterval(a, b);
  }
}

export type NumberSet = NumberInterval[];

export const displayNumberInterval = ({
  bottom,
  upper,
}: NumberInterval): string => {
  return `${bottom.type === "inclusive" ? "[" : "("}${
    bottom.type === "infinity" ? "-∞" : bottom.value
    }, ${upper.type === "infinity" ? "+∞" : upper.value}${
    upper.type === "inclusive" ? "]" : ")"
    }`;
};

export const displayNumberBound = (numberSet: NumberSet): string => {
  return numberSet.map(displayNumberInterval).join(" ∪ ");
};

export const mergeNumberBounds = (a: NumberSet, b: NumberSet): NumberSet => {
  const resultSet: NumberSet = [];

  a.forEach((interval1) => {
    b.forEach((interval2) => {
      const intersection = interval1.intersection(interval2);
      if (intersection) {
        resultSet.push(intersection);
      }
    });
  });

  // TODO: Add normalization
  return resultSet;
};

export type Type = NumberSet;
