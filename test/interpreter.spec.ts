import { TestFixture, Test, Expect, FocusTest } from "alsatian"

import { Context } from "../src/core/Context"
import { builtInFunctions } from "../src"
import { NCall, NConstant } from "../src/core/AST"

@TestFixture("Runs given AST")
export class InterpreterFixture {
  @Test()
  public evaluate() {
    let ctx = new Context(builtInFunctions, new Map([["v", -3]]))
    Expect(ctx.evaluate(new NCall("abs", [new NConstant(-3, [])]))).toEqual(3)
  }
}
