import { IntegerNumberType } from "../..";
import { BaseTypeVisitor } from "./BaseTypeVisitor";

export class MergeIntegralTypeVisitor extends BaseTypeVisitor<
  IntegerNumberType | undefined
> {
  constructor(private type: IntegerNumberType) {
    super();
  }

  // TODO: Add ability to return nothing
  public visitIntegral(type: IntegerNumberType): IntegerNumberType | undefined {
    return this.intersection(this.type, type);
  }

  private intersection(
    { bottom: b1, upper: u1 }: IntegerNumberType,
    { bottom: b2, upper: u2 }: IntegerNumberType,
  ): IntegerNumberType | undefined {
    const bottom =
      b1 !== undefined && b2 !== undefined
        ? Math.max(b1, b2)
        : b1 !== undefined
        ? b1
        : b2;
    const upper =
      u1 !== undefined && u2 !== undefined
        ? Math.min(u1, u2)
        : u1 !== undefined
        ? u1
        : u2;

    if (bottom !== undefined && upper !== undefined && bottom > upper) {
      return undefined;
    }

    return new IntegerNumberType({ bottom, upper });
  }
}
