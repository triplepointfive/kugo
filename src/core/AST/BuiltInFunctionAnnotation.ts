import { FunctionArgs, Value } from ".";
import { MetaType } from "../Type/Meta";
import { FunctionAnnotation } from "./FunctionAnnotation";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class BuiltInFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: FunctionArgs,
    returnType: MetaType,
    public readonly body: (...args: any) => Value,
  ) {
    super(args, returnType);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitBuiltIn(this);
  }
}
