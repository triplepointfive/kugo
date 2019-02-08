import { Expect, Test, TestCase, TestFixture } from "alsatian"
import {
  displayNumberInterval,
  NumberInterval,
  NumberBound,
  displayNumberBound,
  NumberSet
} from "../src"

const inf: NumberBound = { type: "infinity" },
  inc = (v: number): NumberBound => {
    return { type: "inclusive", value: v }
  },
  exc = (v: number): NumberBound => {
    return { type: "exclusive", value: v }
  }

const display = function(numberInterval: NumberInterval | undefined): string {
  if (numberInterval) {
    return displayNumberInterval(numberInterval)
  }

  return "()"
}

@TestFixture("Display number bounds")
export class ExampleTestFixture {
  @TestCase({ bottom: inf, upper: inf }, "(-∞, +∞)")
  @TestCase({ bottom: inc(-3), upper: inf }, "[-3, +∞)")
  @TestCase({ bottom: exc(3), upper: inf }, "(3, +∞)")
  @TestCase({ bottom: inc(3), upper: inc(5) }, "[3, 5]")
  @TestCase({ bottom: inf, upper: inc(5) }, "(-∞, 5]")
  @TestCase({ bottom: inf, upper: exc(-3) }, "(-∞, -3)")
  public displayNumberInterval(bound: NumberInterval, expected: string) {
    Expect(displayNumberInterval(bound)).toBe(expected)
  }

  @TestCase(
    [{ bottom: inf, upper: exc(3) }, { bottom: exc(3), upper: inf }],
    "(-∞, 3) ∪ (3, +∞)"
  )
  public displayNumberBound(numberSet: NumberSet, expected: string) {
    Expect(displayNumberBound(numberSet)).toBe(expected)
  }

  @TestCase({ bottom: inf, upper: exc(1) }, "(-∞, 1)")
  @TestCase({ bottom: inf, upper: inc(5) }, "(-∞, 5]")
  @TestCase({ bottom: inc(1), upper: exc(5) }, "[1, 5)")
  @TestCase({ bottom: inc(5), upper: inf }, "[5, 5]")
  @TestCase({ bottom: exc(5), upper: inf }, "()")
  public intersectionWithNegativeInfinity(
    interval: NumberInterval,
    expected: string
  ) {
    Expect(
      display(new NumberInterval(inf, inc(5)).intersection(interval))
    ).toBe(expected)
  }

  @TestCase({ bottom: inf, upper: exc(1) }, "[-5, 1)")
  @TestCase({ bottom: inc(-1), upper: exc(5) }, "[-1, 5)")
  @TestCase({ bottom: inc(5), upper: inf }, "[5, +∞)")
  @TestCase({ bottom: inc(-9), upper: inc(-6) }, "()")
  public intersectionWithPositiveInfinity(
    interval: NumberInterval,
    expected: string
  ) {
    Expect(
      display(new NumberInterval(inc(-5), inf).intersection(interval))
    ).toBe(expected)
  }

  @Test()
  public intersectionLimited() {
    Expect(
      display(
        new NumberInterval(inc(-5), exc(3)).intersection(
          new NumberInterval(exc(-4), inc(1))
        )
      )
    ).toBe("(-4, 1]")
  }

  @Test()
  public intersectionUniversal() {
    Expect(
      display(
        new NumberInterval(inf, inf).intersection(new NumberInterval(inf, inf))
      )
    ).toBe("(-∞, +∞)")
  }
}
