import { Expect, TestCase, TestFixture } from "alsatian"
import {
  displayNumberInterval,
  NumberInterval,
  NumberBound,
  displayNumberBound,
  NumberSet
} from "../src"

const inf = { type: "infinity" },
  inc = (v: number): NumberBound => {
    return { type: "inclusive", value: v }
  },
  exc = (v: number): NumberBound => {
    return { type: "exclusive", value: v }
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
}
