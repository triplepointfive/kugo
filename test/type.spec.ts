import { Expect, Test, TestCase, TestFixture } from "alsatian";
import {
  displayNumberBound,
  displayNumberInterval,
  INumberBound,
  INumberInterval,
  mergeNumberBounds,
  NumberSet,
} from "../src/core/Type";

const inf: INumberBound = { type: "infinity" };
const inc = (v: number): INumberBound => {
  return { type: "inclusive", value: v };
};
const exc = (v: number): INumberBound => {
  return { type: "exclusive", value: v };
};

const display = (numberInterval: INumberInterval | undefined): string => {
  if (numberInterval) {
    return displayNumberInterval(numberInterval);
  }

  return "()";
};

@TestFixture("Type and what it can")
export class TypeFixture {
  @TestCase({ bottom: inf, upper: inf }, "(-∞, +∞)")
  @TestCase({ bottom: inc(-3), upper: inf }, "[-3, +∞)")
  @TestCase({ bottom: exc(3), upper: inf }, "(3, +∞)")
  @TestCase({ bottom: inc(3), upper: inc(5) }, "[3, 5]")
  @TestCase({ bottom: inf, upper: inc(5) }, "(-∞, 5]")
  @TestCase({ bottom: inf, upper: exc(-3) }, "(-∞, -3)")
  public displayNumberInterval(bound: INumberInterval, expected: string) {
    Expect(displayNumberInterval(bound)).toBe(expected);
  }

  @TestCase(
    [{ bottom: inf, upper: exc(3) }, { bottom: exc(3), upper: inf }],
    "(-∞, 3) ∪ (3, +∞)",
  )
  public displayNumberBound(numberSet: NumberSet, expected: string) {
    Expect(displayNumberBound(numberSet)).toBe(expected);
  }

  @TestCase({ bottom: inf, upper: exc(1) }, "(-∞, 1)")
  @TestCase({ bottom: inf, upper: inc(5) }, "(-∞, 5]")
  @TestCase({ bottom: inc(1), upper: exc(5) }, "[1, 5)")
  @TestCase({ bottom: inc(5), upper: inf }, "[5, 5]")
  @TestCase({ bottom: exc(5), upper: inf }, "()")
  public intersectionWithNegativeInfinity(
    interval: INumberInterval,
    expected: string,
  ) {
    Expect(
      display(new INumberInterval(inf, inc(5)).intersection(interval)),
    ).toBe(expected);
  }

  @TestCase({ bottom: inf, upper: exc(1) }, "[-5, 1)")
  @TestCase({ bottom: inc(-1), upper: exc(5) }, "[-1, 5)")
  @TestCase({ bottom: inc(5), upper: inf }, "[5, +∞)")
  @TestCase({ bottom: inc(-9), upper: inc(-6) }, "()")
  public intersectionWithPositiveInfinity(
    interval: INumberInterval,
    expected: string,
  ) {
    Expect(
      display(new INumberInterval(inc(-5), inf).intersection(interval)),
    ).toBe(expected);
  }

  @Test()
  public intersectionLimited() {
    Expect(
      display(
        new INumberInterval(inc(-5), exc(3)).intersection(
          new INumberInterval(exc(-4), inc(1)),
        ),
      ),
    ).toBe("(-4, 1]");
  }

  @Test()
  public intersectionUniversal() {
    Expect(
      display(
        new INumberInterval(inf, inf).intersection(
          new INumberInterval(inf, inf),
        ),
      ),
    ).toBe("(-∞, +∞)");
  }

  // TODO: Split test in more specific specs
  @Test()
  public mergeNumberBounds() {
    Expect(
      mergeNumberBounds(
        [new INumberInterval(inf, inc(5)), new INumberInterval(inc(10), inf)],
        [new INumberInterval(exc(3), exc(11))],
      ),
    ).toEqual([
      new INumberInterval(exc(3), inc(5)),
      new INumberInterval(inc(10), exc(11)),
    ]);
  }
}
