import {
  IntegerNumberInterval,
  IntegerNumberType,
  UnionMetaType,
  Z,
} from "../../../../src";

describe("UnionMetaType", () => {
  it("intersect same", () => {
    expect(Z.intersect(Z).display()).toEqual(Z.display());
  });

  it("intersect two unions", () => {
    const a = new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({ bottom: 0, upper: 10 }),
        new IntegerNumberInterval({ bottom: 20, upper: 30 }),
      ]),
    ]);

    const b = new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({ bottom: 5, upper: 15 }),
        new IntegerNumberInterval({ bottom: 25, upper: 35 }),
      ]),
    ]);

    expect(a.intersect(b).display()).toEqual("[5, 10] ∪ [25, 30]");
  });

  it("intersect without intersection", () => {
    const a = new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({ bottom: 0, upper: 10 }),
      ]),
    ]);

    const b = new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({ bottom: 25, upper: 35 }),
      ]),
    ]);

    expect(a.intersect(b).display()).toEqual("never");
  });
});
