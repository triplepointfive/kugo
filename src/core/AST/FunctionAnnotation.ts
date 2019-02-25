import { Arg, INExpression } from ".";
import { IMetaType } from "../Type/Meta";

export class FunctionAnnotation {
  constructor(
    public readonly args: Arg[],
    public readonly returnType: IMetaType,
    public readonly body: INExpression,
  ) {}

  public displayType(): string {
    if (this.args.length) {
      return `${this.args
        .map(([name, meta]) =>
          meta.options.map(type => type.display()).join(" ∪ "),
        )
        .join(" → ")} → ${this.returnType.options[0].display()}`;
    } else {
      return this.returnType.options[0].display();
    }
  }
}
