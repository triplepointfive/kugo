import { IntegerNumberInterval } from "../src/core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "../src/core/Type/Integral/IntegerNumberType";

describe("IntegerNumberInterval", () => {
  it("display", () => {
    const cases: Array<[any, string]> = [
      [{}, "(-∞, +∞)"],
      [{ bottom: -3 }, "[-3, +∞)"],
      [{ bottom: 3, upper: 5 }, "[3, 5]"],
      [{ upper: -3 }, "(-∞, -3]"],
    ];

    cases.forEach(([bound, expected]) => {
      expect(new IntegerNumberInterval(bound).display()).toBe(expected);
    });
  });

  describe("intersection", () => {
    it("with negative infinity", () => {
      const cases: Array<[any, string]> = [
        [{ upper: 5 }, "(-∞, 5]"],
        [{ bottom: 1, upper: 5 }, "[1, 5]"],
        [{ bottom: 5, upper: 5 }, "5"],
        [{ bottom: 5 }, "5"],
      ];

      cases.forEach(([interval, expected]) => {
        const range = new IntegerNumberInterval({ upper: 5 }).intersection(
          new IntegerNumberInterval(interval),
        );

        expect(range && range.display()).toBe(expected);
      });
    });

    it("with positive infinity", () => {
      const cases: Array<[any, string | undefined]> = [
        [{ upper: 1 }, "[-5, 1]"],
        [{ bottom: -1, upper: 5 }, "[-1, 5]"],
        [{ bottom: 5 }, "[5, +∞)"],
        [{ bottom: -9, upper: -6 }, undefined],
      ];

      cases.forEach(([interval, expected]) => {
        const range = new IntegerNumberInterval({ bottom: -5 }).intersection(
          new IntegerNumberInterval(interval),
        );

        expect(range && range.display()).toBe(expected);
      });
    });

    it("limited", () => {
      const range = new IntegerNumberInterval({
        bottom: -5,
        upper: 3,
      }).intersection(new IntegerNumberInterval({ bottom: -4, upper: 1 }));

      expect(range && range.display()).toBe("[-4, 1]");
    });

    it("universal", () => {
      const range = new IntegerNumberInterval().intersection(
        new IntegerNumberInterval(),
      );

      expect(range && range.display()).toBe("(-∞, +∞)");
    });
  });
});

describe("IntegerNumberType", () => {
  it("displayNumberBound", () => {
    const numberSet: IntegerNumberType = new IntegerNumberType([
      new IntegerNumberInterval({ upper: 3 }),
      new IntegerNumberInterval({ bottom: 3 }),
    ]);
    const expected: string = "(-∞, 3] ∪ [3, +∞)";

    expect(numberSet.display()).toBe(expected);
  });

  it("mergeNumberBounds", () => {
    const a = new IntegerNumberType([
      new IntegerNumberInterval({ upper: 5 }),
      new IntegerNumberInterval({ bottom: 10 }),
    ]);
    const b = new IntegerNumberType([
      new IntegerNumberInterval({ bottom: 3, upper: 11 }),
    ]);

    expect(a.merge(b)).toEqual(
      new IntegerNumberType([
        new IntegerNumberInterval({ bottom: 3, upper: 5 }),
        new IntegerNumberInterval({ bottom: 10, upper: 11 }),
      ]),
    );
  });
});
