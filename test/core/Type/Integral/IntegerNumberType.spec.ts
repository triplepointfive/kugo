import { IntegerNumberInterval, IntegerNumberType } from "../../../../src";

describe("IntegerNumberType", () => {
  it("displayNumberBound", () => {
    const numberSet: IntegerNumberType = new IntegerNumberType([
      new IntegerNumberInterval({ upper: 3 }),
      new IntegerNumberInterval({ bottom: 3 }),
    ]);
    const expected: string = "(-∞, 3] ∪ [3, +∞)";

    expect(numberSet.display()).toBe(expected);
  });
});
