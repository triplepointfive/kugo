import { TestFixture, Test, Expect } from "alsatian"

import { Context } from "../src/core/Context"
import { builtInFunctions } from "../src"
import { NCall, NConstant } from "../src/core/AST"

@TestFixture("Runs given AST")
export class InterpreterFixture {
  @Test()
  public evaluate() {
    let ctx = new Context(builtInFunctions, new Map())
    Expect(ctx.evaluate(new NCall("abs", [new NConstant(-3, [])]))).toEqual(3)
  }
}
