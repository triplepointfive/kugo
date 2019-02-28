import { INExpression, Value } from ".";
import { Maybe } from "../../utils/Maybe";
import { Context } from "../Context";
import { MetaType } from "../Type/Meta";

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: MetaType) {}

  public eval(context: Context): Maybe<Value> {
    return Maybe.just(this.value);
  }
}
