import { NumberPExpression, UnionMetaType } from "../../../src";

describe("NumberPExpression", () => {
  it("type", () => {
    const builtType = new NumberPExpression(3).type();
    expect(builtType.failed).toBeFalsy();
    builtType.with(type => {
      expect(type).toBeInstanceOf(UnionMetaType);
      expect(type.display()).toEqual("3");
    });
  });
});
