import { NExpression } from ".";
import { AstVisitor } from "./Visitor/AstVisitor";

export class NCall extends NExpression {
  constructor(
    public readonly name: string,
    public readonly args: NExpression[],
  ) {
    super();
  }

  public visit<T>(visitor: AstVisitor<T>): T {
    return visitor.visitInvocation(this);
  }
}
