import { NumberPExpression } from "../../../src/parser/AST/NumberPExpression";

describe("NumberPExpression", () => {
  it("type", () => {
    const type = new NumberPExpression(3).type();
    expect(type.options.length).toEqual(1);
    expect(type.options[0].display()).toEqual("3");
  });
});
