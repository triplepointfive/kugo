import {
  AnyMetaType,
  builtInContext,
  builtInFunctions,
  Context,
  NCall,
  NConstant,
  parseKugoFile,
} from "../src";

describe("InterpreterFixture", () => {
  it("evaluate", () => {
    const ctx = new Context(builtInFunctions, new Map([["v", -3]]));
    expect(
      ctx.evaluate(new NCall("abs", [new NConstant(-3, new AnyMetaType())])),
    ).toEqual(3);
  });

  it("undefined function called", () => {
    const parsedAst = parseKugoFile(`main = summ 1 3`).ast;
    const ctx = builtInContext.extend(parsedAst);

    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0].message).toEqual("Failed to obtain type of summ");
  });
});
