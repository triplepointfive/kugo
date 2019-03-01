import { FunctionArgs, NExpression } from ".";
import { MetaType } from "../Type/Meta";

export class FunctionAnnotation {
  constructor(
    public readonly args: FunctionArgs,
    public readonly returnType: MetaType,
    public readonly body: NExpression,
  ) {}

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
