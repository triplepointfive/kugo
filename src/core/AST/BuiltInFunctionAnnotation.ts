import { Value } from ".";
import { Context } from "../Context";
import { FunctionAnnotation, FunctionType } from "./FunctionAnnotation";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class BuiltInFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: string[],
    private readonly functionTypes: FunctionType[],
    public readonly body: (ctx: Context, ...args: Value[]) => Value,
    public readonly name?: string,
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
