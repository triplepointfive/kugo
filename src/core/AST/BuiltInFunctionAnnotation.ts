import { Value } from ".";
import { FunctionAnnotation, FunctionType } from "./FunctionAnnotation";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class BuiltInFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: string[],
    types: FunctionType[],
    public readonly body: (...args: any) => Value,
  ) {
    super(args, types);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitBuiltIn(this);
  }
}
