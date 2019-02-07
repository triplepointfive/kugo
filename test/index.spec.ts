import { Expect, TestCase, TestFixture } from "alsatian"
import { displayBound, Bound } from "../src"

@TestFixture("Display number bounds")
export class ExampleTestFixture {
  @TestCase({ bottom: "infinity", upper: "infinity" }, "-∞, +∞")
  @TestCase({ bottom: -3, upper: "infinity" }, "-3, +∞")
  @TestCase({ bottom: 3, upper: "infinity" }, "3, +∞")
  @TestCase({ bottom: 3, upper: 5 }, "3, 5")
  @TestCase({ bottom: "infinity", upper: 5 }, "-∞, 5")
  @TestCase({ bottom: "infinity", upper: -3 }, "-∞, -3")
  public displayBound(bound: Bound, expected: string) {
    Expect(displayBound(bound)).toBe(expected)
  }
}
