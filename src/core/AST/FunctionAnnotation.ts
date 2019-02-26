import { FunctionArgs, INExpression } from ".";
import { MetaType } from "../Type/Meta";

export class FunctionAnnotation {
  constructor(
    public readonly args: FunctionArgs,
    public readonly returnType: MetaType,
    public readonly body: INExpression,
  ) {}

  public displayType(): string {
    if (this.args.length) {
      return `${this.args
        .map(([_, meta]) => meta.display())
        .join(" → ")} → ${this.returnType.display()}`;
    } else {
      return this.returnType.display();
    }
  }
}
