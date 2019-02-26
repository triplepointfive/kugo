import { NumberPExpression, UnionMetaType } from "../../../src";

describe("NumberPExpression", () => {
  it("type", () => {
    const type = new NumberPExpression(3).type();
    expect(type).toBeInstanceOf(UnionMetaType);
    expect(type.display()).toEqual("3");
  });
});
