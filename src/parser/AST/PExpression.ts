import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export abstract class PExpression {
  public abstract visit<T>(visitor: PExpressionVisitor<T>): T;
}
