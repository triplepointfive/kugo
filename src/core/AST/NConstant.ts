import { INExpression, Value } from ".";
import { Context } from "../Context";
import { KugoError } from "../KugoError";
import { MetaType } from "../Type/Meta";

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: MetaType) {}

  public eval(context: Context): Value | KugoError[] {
    return this.value;
  }
}
