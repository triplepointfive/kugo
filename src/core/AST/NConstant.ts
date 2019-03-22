import { EvaluatedValue, NExpression } from ".";
import { MetaType } from "../Type/Meta";
import { AstVisitor } from "./Visitor/AstVisitor";

export class NConstant extends NExpression {
  // TODO: Check whether type is required here
  constructor(
    public readonly value: EvaluatedValue,
    public readonly type: MetaType,
  ) {
    super();
  }

  public visit<T>(visitor: AstVisitor<T>): T {
    return visitor.visitConstant(this);
  }
}
