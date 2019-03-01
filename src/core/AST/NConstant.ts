import { NExpression, Value } from ".";
import { MetaType } from "../Type/Meta";
import { AstVisitor } from "./Visitor/AstVisitor";

export class NConstant extends NExpression {
  // TODO: Check whether type is required here
  constructor(public readonly value: Value, public readonly type: MetaType) {
    super();
  }

  public visit<T>(visitor: AstVisitor<T>): T {
    return visitor.visitConstant(this);
  }
}
