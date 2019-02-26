import { INExpression, Value } from ".";
import { Context } from "../Context";
import { MetaType } from "../Type/Meta";

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: MetaType) {}

  public eval(context: Context): Value | Error[] {
    return this.value;
  }
}
