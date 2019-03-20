import { flatMap } from "lodash";
import { FunctionAnnotation, FunctionType } from "./FunctionAnnotation";
import { NGuard } from "./NGuard";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class AddedFunctionAnnotation extends FunctionAnnotation {
  constructor(args: string[], public guards: NGuard[]) {
    super(args);
  }

  public visit<T>(visitor: FunctionAnnotationVisitor<T>): T {
    return visitor.visitAdded(this);
  }

  public types(): FunctionType[] {
    return flatMap(this.guards, guard => guard.types);
  }
}
