import { Context, FunctionsTable } from "../../core/Context";
import { KugoError } from "../../core/KugoError";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { PExpression } from "./PExpression";
import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export class CallPExpression extends PExpression {
  constructor(
    public readonly name: string,
    public readonly args: PExpression[],
  ) {
    super();
  }

  public type(ctx: Context, ext: FunctionsTable): Maybe<MetaType> {
    const expFunctionAnnotation =
      ext.get(this.name) || ctx.lookupFunction(this.name);

    if (!expFunctionAnnotation) {
      return Maybe.fail(new KugoError(`Failed to obtain type of ${this.name}`));
    }

    return Maybe.just(expFunctionAnnotation.returnType);
  }

  public visit<T>(visitor: PExpressionVisitor<T>): T {
    return visitor.visitFunctionCall(this);
  }
}
