import { builtInFunctions } from "../src";
import { NCall } from "../src/core/AST/NCall";
import { NConstant } from "../src/core/AST/NConstant";
import { Context } from "../src/core/Context";

describe("InterpreterFixture", () => {
  it("evaluate", () => {
    const ctx = new Context(builtInFunctions, new Map([["v", -3]]));
    expect(ctx.evaluate(new NCall("abs", [new NConstant(-3, [])]))).toEqual(3);
  });
});
