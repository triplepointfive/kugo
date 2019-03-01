import { FunctionArgs } from ".";
import { MetaType } from "../Type/Meta";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export abstract class FunctionAnnotation {
  constructor(
    public readonly args: FunctionArgs,
    public readonly returnType: MetaType,
  ) {}

  public abstract visit<T>(visitor: FunctionAnnotationVisitor<T>): T;

  public displayType(): string {
    if (this.args.length) {
      return `${this.args
        .map(({ type }) => type.display())
        .join(" → ")} → ${this.returnType.display()}`;
    } else {
      return this.returnType.display();
    }
  }
}
