import {
  AnyMetaType,
  builtInFunctions,
  Context,
  NCall,
  NConstant,
} from "../src";

describe("InterpreterFixture", () => {
  it("evaluate", () => {
    const ctx = new Context(builtInFunctions, new Map([["v", -3]]));
    expect(
      ctx.evaluate(new NCall("abs", [new NConstant(-3, new AnyMetaType())])),
    ).toEqual(3);
  });
});
