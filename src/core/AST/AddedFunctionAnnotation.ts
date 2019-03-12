import { FunctionAnnotation, FunctionType } from "./FunctionAnnotation";
import { NGuard } from "./NGuard";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class AddedFunctionAnnotation extends FunctionAnnotation {
  constructor(args: string[], types: FunctionType[], public guards: NGuard[]) {
    super(args, types);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitAdded(this);
  }
}
