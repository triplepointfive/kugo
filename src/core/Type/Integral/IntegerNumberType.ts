import { BaseTypeVisitor } from "../BaseTypeVisitor";
import { NumberType } from "../NumberType";
import { IntegerNumberInterval } from "./IntegerNumberInterval";

export class IntegerNumberType extends NumberType {
  constructor(public readonly bounds: IntegerNumberInterval[] = []) {
    super();
  }

  public visit<T>(visitor: BaseTypeVisitor<T>): T {
    return visitor.visitIntegral(this);
  }

  public display(): string {
    // EXTRA: Should never get here
    if (this.bounds.length === 0) {
      return "ℤ";
    }

    if (
      this.bounds[0].bottom === undefined &&
      this.bounds[0].upper === undefined
    ) {
      return "ℤ";
    }

    return this.bounds.map(b => b.display()).join(" ∪ ");
  }
}
