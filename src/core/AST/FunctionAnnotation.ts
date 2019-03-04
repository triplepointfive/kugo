import { FunctionArgs } from ".";
import { MetaType } from "../Type/Meta";
import { DisplayMetaTypeVisitor } from "../Type/Meta/Visitor/DisplayMetaTypeVisitor";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export abstract class FunctionAnnotation {
  constructor(
    public readonly args: FunctionArgs,
    public readonly returnType: MetaType,
  ) {}

  public abstract visit<T>(visitor: FunctionAnnotationVisitor<T>): T;

  public displayType(): string {
    return DisplayMetaTypeVisitor.build(this);
  }
}
