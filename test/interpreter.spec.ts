import { Expect, Test, TestFixture } from "alsatian";

import { builtInFunctions } from "../src";
import { NCall, NConstant } from "../src/core/AST";
import { Context } from "../src/core/Context";

@TestFixture("Runs given AST")
export class InterpreterFixture {
  @Test()
  public evaluate() {
    const ctx = new Context(builtInFunctions, new Map([["v", -3]]));
    Expect(ctx.evaluate(new NCall("abs", [new NConstant(-3, [])]))).toEqual(3);
  }
}
