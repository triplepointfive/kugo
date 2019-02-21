import { INExpression, Value } from ".";
import { Context } from "../Context";
import { Type } from "../Type";

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: Type) { }

  public eval(context: Context): Value | Error[] {
    return this.value;
  }
}
