import { Value } from "..";
import { KugoError } from "../../..";
import { Maybe } from "../../../utils/Maybe";
import { AddedFunctionAnnotation } from "../AddedFunctionAnnotation";
import { BuiltInFunctionAnnotation } from "../BuiltInFunctionAnnotation";
import { EvalAstVisitor } from "./EvalAstVisitor";
import { FunctionAnnotationVisitor } from "./FunctionAnnotationVisitor";

export class EvalFunctionAnnotationVisitor extends FunctionAnnotationVisitor<
  Maybe<Value>
> {
  public visitBuiltIn(fa: BuiltInFunctionAnnotation): Maybe<Value> {
    const missed: string[] = [];
    const values: Value[] = [];

    fa.args.forEach(name => {
      const val = this.context.lookupLocal(name);

      if (val !== undefined) {
        values.push(val);
      } else {
        missed.push(name);
      }
    });

    if (missed.length) {
      return Maybe.fail(
        missed.map(name => new KugoError(`Function ${name} not found`)),
      );
    }

    return Maybe.just(fa.body(...values));
  }

  public visitAdded(fa: AddedFunctionAnnotation): Maybe<Value> {
    // TODO: Lookup for matching guard
    const guard = fa.guards.find(g => g.match(this.context));

    if (guard !== undefined) {
      return guard.body.visit(new EvalAstVisitor(this.context));
    }

    return Maybe.fail(new KugoError(`Guard lookup failed`));
  }
}
