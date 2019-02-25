import { builtInContext, Z } from "../../../src";
import { PFunctionDeclaration } from "../../../src/parser/AST/IPFunctionDeclaration";
import { CallPExpression } from "../../../src/parser/AST/CallPExpression";
import { NumberPExpression } from "../../../src/parser/AST/NumberPExpression";

describe("PFunctionDeclaration", () => {
  it("deriving return type", () => {
    const ctx = builtInContext.extend({
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

    const main = ctx.lookupFunction("main");
    expect(main && main.returnType).toEqual(Z);
    expect(main && main.args).toEqual([]);
    expect(main && main.body.eval(ctx)).toEqual(8);

    const addThree = ctx.lookupFunction("addThree");
    expect(addThree && addThree.returnType).toEqual(Z);
    expect(addThree && addThree.args).toEqual([["a", Z]]);
    expect(
      addThree && addThree.body.eval(ctx.nest(new Map([["a", -3]]))),
    ).toEqual(0);
  });
});
