import { INExpression, Value } from ".";
import { Context } from "../Context";
import { KugoError } from "../KugoError";

export class NCall implements INExpression {
  constructor(
    public readonly name: string,
    public readonly args: [INExpression],
  ) {}

  public eval(context: Context): Value | KugoError[] {
    return context.lookupLocal(this.name) || this.buildMethod(context);
  }

  private buildMethod(context: Context): Value | KugoError[] {
    const functionAnnotation = context.lookupFunction(this.name);
    if (functionAnnotation === undefined) {
      return [new KugoError(`Unknown function ${this.name}`)];
    }

    return functionAnnotation.body.eval(context);
  }
}
