import {
  displayNumberBound,
  displayNumberInterval,
  INumberBound,
  INumberInterval,
  mergeNumberBounds,
  NumberInterval,
  NumberSet,
} from "../src/core/Type";

const inf: INumberBound = { type: "infinity" };
const inc = (v: number): INumberBound => {
  return { type: "inclusive", value: v };
};
const exc = (v: number): INumberBound => {
  return { type: "exclusive", value: v };
};

const display = (numberInterval: NumberInterval | undefined): string => {
  if (numberInterval) {
    return displayNumberInterval(numberInterval);
  }

  return "()";
};

describe("Type and what it can", () => {
  it("displayNumberInterval", () => {
    const cases: Array<[INumberInterval, string]> = [
      [{ bottom: inf, upper: inf }, "(-∞, +∞)"],
      [{ bottom: inc(-3), upper: inf }, "[-3, +∞)"],
      [{ bottom: exc(3), upper: inf }, "(3, +∞)"],
      [{ bottom: inc(3), upper: inc(5) }, "[3, 5]"],
      [{ bottom: inf, upper: inc(5) }, "(-∞, 5]"],
      [{ bottom: inf, upper: exc(-3) }, "(-∞, -3)"],
    ];

    cases.forEach(([{ bottom, upper }, expected]) => {
      expect(displayNumberInterval(new NumberInterval(bottom, upper))).toBe(expected);
    });
  });

  it("displayNumberBound", () => {
    const numberSet: NumberSet = [new NumberInterval(inf, exc(3)), new NumberInterval(exc(3), inf)];
    const expected: string = "(-∞, 3) ∪ (3, +∞)";

    expect(displayNumberBound(numberSet)).toBe(expected);
  });

  it("intersectionWithNegativeInfinity", () => {
    const cases: Array<[INumberInterval, string]> = [
      [{ bottom: inf, upper: exc(1) }, "(-∞, 1)"],
      [{ bottom: inf, upper: inc(5) }, "(-∞, 5]"],
      [{ bottom: inc(1), upper: exc(5) }, "[1, 5)"],
      [{ bottom: inc(5), upper: inf }, "[5, 5]"],
      [{ bottom: exc(5), upper: inf }, "()"],
    ];

    cases.forEach(([interval, expected]) => {
      expect(display(new NumberInterval(inf, inc(5)).intersection(interval))).toBe(expected);
    });
  });

  it("intersectionWithPositiveInfinity", () => {
    const cases: Array<[INumberInterval, string]> = [
      [{ bottom: inf, upper: exc(1) }, "[-5, 1)"],
      [{ bottom: inc(-1), upper: exc(5) }, "[-1, 5)"],
      [{ bottom: inc(5), upper: inf }, "[5, +∞)"],
      [{ bottom: inc(-9), upper: inc(-6) }, "()"],
    ];

    cases.forEach(([interval, expected]) => {
      expect(display(new NumberInterval(inc(-5), inf).intersection(interval))).toBe(expected);
    });
  });

  it("intersectionLimited", () => {
    expect(
      display(
        new NumberInterval(inc(-5), exc(3)).intersection(
          new NumberInterval(exc(-4), inc(1)),
        ),
      ),
    ).toBe("(-4, 1]");
  });

  it("intersectionUniversal", () => {
    expect(
      display(
        new NumberInterval(inf, inf).intersection(
          new NumberInterval(inf, inf),
        ),
      ),
    ).toBe("(-∞, +∞)");
  });

  it("mergeNumberBounds", () => {
    expect(
      mergeNumberBounds(
        [new NumberInterval(inf, inc(5)), new NumberInterval(inc(10), inf)],
        [new NumberInterval(exc(3), exc(11))],
      ),
    ).toEqual([
      new NumberInterval(exc(3), inc(5)),
      new NumberInterval(inc(10), exc(11)),
    ]);
  });
});
