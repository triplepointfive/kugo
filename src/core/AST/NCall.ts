import { NExpression, Value } from ".";
import { Maybe } from "../../utils/Maybe";
import { Context } from "../Context";
import { KugoError } from "../KugoError";

export class NCall implements NExpression {
  constructor(
    public readonly name: string,
    public readonly args: [NExpression],
  ) {}

  public eval(context: Context): Maybe<Value> {
    const local = context.lookupLocal(this.name);
    if (local) {
      return Maybe.just(local);
    }

    return this.buildMethod(context);
  }

  private buildMethod(context: Context): Maybe<Value> {
    const functionAnnotation = context.lookupFunction(this.name);
    if (functionAnnotation === undefined) {
      return Maybe.fail(new KugoError(`Unknown function ${this.name}`));
    }

    return functionAnnotation.body.eval(context);
  }
}
