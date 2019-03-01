import { FunctionArgs, NExpression } from ".";
import { MetaType } from "../..";
import { FunctionAnnotation } from "./FunctionAnnotation";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class AddedFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: FunctionArgs,
    returnType: MetaType,
    public readonly body: NExpression,
  ) {
    super(args, returnType);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitAdded(this);
  }
}
