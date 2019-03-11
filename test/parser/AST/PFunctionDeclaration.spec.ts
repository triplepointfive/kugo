import {
  builtInContext,
  CallPExpression,
  NumberPExpression,
  PFunctionDeclaration,
  Z,
} from "../../../src";

describe("PFunctionDeclaration", () => {
  it("deriving return type", () => {
    const buildCtx = builtInContext.extend({
      functionDeclarations: [
        new PFunctionDeclaration(
          "addThree",
          ["a"],
          new CallPExpression("sum", [
            new NumberPExpression(3),
            new CallPExpression("a", []),
          ]),
        ),
        new PFunctionDeclaration(
          "main",
          [],
          new CallPExpression("addThree", [new NumberPExpression(5)]),
        ),
      ],
    });

    expect(buildCtx.failed).toBeFalsy();
    buildCtx.with(ctx => {
      const main = ctx.lookupFunction("main");
      expect(main && main.returnType).toEqual(Z);
      expect(main && main.args).toEqual([]);
      expect(main && ctx.evalFunction(main).value).toEqual(8);

      const addThree = ctx.lookupFunction("addThree");
      expect(addThree && addThree.returnType).toEqual(Z);
      expect(addThree && addThree.args).toEqual([{ name: "a", type: Z }]);
      expect(
        addThree && ctx.nest(new Map([["a", -3]])).evalFunction(addThree).value,
      ).toEqual(0);
    });
  });
});