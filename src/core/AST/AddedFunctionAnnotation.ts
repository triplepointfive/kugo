import { FunctionArgs } from ".";
import { MetaType } from "../..";
import { FunctionAnnotation } from "./FunctionAnnotation";
import { NGuard } from "./NGuard";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class AddedFunctionAnnotation extends FunctionAnnotation {
  constructor(
    args: FunctionArgs,
    returnType: MetaType,
    public guards: NGuard[],
  ) {
    super(args, returnType);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitAdded(this);
  }
}
