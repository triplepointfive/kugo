import { NExpression } from ".";
import { Context } from "../Context";
import { FunctionType } from "./FunctionAnnotation";
import { NPredicate } from "./NPredicate";

export class NGuard {
  constructor(
    public readonly predicate: NPredicate,
    public readonly body: NExpression,
    public readonly types: FunctionType[],
  ) {}

  public match(context: Context): boolean {
    return this.predicate.match(context);
  }
}
