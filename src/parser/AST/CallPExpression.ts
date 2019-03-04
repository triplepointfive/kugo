import { PExpression } from "./PExpression";
import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export class CallPExpression extends PExpression {
  constructor(
    public readonly name: string,
    public readonly args: PExpression[],
  ) {
    super();
  }

  public visit<T>(visitor: PExpressionVisitor<T>): T {
    return visitor.visitFunctionCall(this);
  }
}
