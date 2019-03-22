import { Value } from ".";
import { FunctionAnnotation, FunctionType } from "./FunctionAnnotation";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class BuiltInFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: string[],
    private readonly functionTypes: FunctionType[],
    public readonly body: (...args: Value[]) => Value,
  ) {
    super(args);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitBuiltIn(this);
  }

  public types(): FunctionType[] {
    return this.functionTypes;
  }
}
