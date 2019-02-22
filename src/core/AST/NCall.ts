import { INExpression, Value } from ".";
import { Context } from "../Context";

export class NCall implements INExpression {
  constructor(
    public readonly name: string,
    public readonly args: [INExpression],
  ) {}

  public eval(context: Context): Value | Error[] {
    return context.lookupLocal(this.name) || this.buildMethod(context);
  }

  private buildMethod(context: Context): Value | Error[] {
    const functionAnnotation = context.lookupFunction(this.name);
    if (functionAnnotation === undefined) {
      return [new Error(`Unknown function ${this.name}`)];
    }

    return functionAnnotation.body.eval(context);
  }
}
