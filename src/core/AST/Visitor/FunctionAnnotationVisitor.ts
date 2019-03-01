import { Context } from "../../Context";
import { AddedFunctionAnnotation } from "../AddedFunctionAnnotation";
import { BuiltInFunctionAnnotation } from "../BuiltInFunctionAnnotation";

export abstract class FunctionAnnotationVisitor<T> {
  constructor(protected context: Context) {}

  public abstract visitBuiltIn(fa: BuiltInFunctionAnnotation): T;
  public abstract visitAdded(fa: AddedFunctionAnnotation): T;
}
