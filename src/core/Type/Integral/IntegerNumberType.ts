import { BaseTypeVisitor } from "../BaseTypeVisitor";
import { NumberType } from "../NumberType";

export class IntegerNumberType extends NumberType {
  public readonly bottom?: number;
  public readonly upper?: number;

  constructor({
    bottom,
    upper,
  }: {
    bottom?: number;
    upper?: number;
  } = {}) {
    super();
    this.bottom = bottom;
    this.upper = upper;
  }

  public visit<T>(visitor: BaseTypeVisitor<T>): T {
    return visitor.visitIntegral(this);
  }

  public display(): string {
    if (this.upper === undefined) {
      switch (this.bottom) {
        case undefined:
          return "ℤ";
        case 0:
          return "ℕ0";
        case 1:
          return "ℕ";
        default:
          return `${this.displayBottom()}, +∞)`;
      }
    }

    if (this.bottom !== undefined && this.bottom === this.upper) {
      return `${this.bottom}`;
    }

    return `${this.displayBottom()}, ${this.upper}]`;
  }

  private displayBottom(): string {
    return `${this.bottom !== undefined ? "[" : "("}${
      this.bottom !== undefined ? this.bottom : "-∞"
    }`;
  }
}
