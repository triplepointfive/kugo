import { INExpression, Value } from ".";
import { Context } from "../Context";
import { IMetaType } from "../Type/Meta";

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: IMetaType) {}

  public eval(context: Context): Value | Error[] {
    return this.value;
  }
}
