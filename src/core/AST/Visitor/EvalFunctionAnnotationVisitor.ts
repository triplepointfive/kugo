import { Value } from "..";
import { AddedFunctionAnnotation } from "../AddedFunctionAnnotation";
import { BuiltInFunctionAnnotation } from "../BuiltInFunctionAnnotation";
import { EvalAstVisitor } from "./EvalAstVisitor";
import { FunctionAnnotationVisitor } from "./FunctionAnnotationVisitor";

export class EvalFunctionAnnotationVisitor extends FunctionAnnotationVisitor<
  Value
> {
  public visitBuiltIn(fa: BuiltInFunctionAnnotation): Value {
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
      throw new Error(
        missed.map(name => `Function ${name} not found`).join("\n"),
      );
    }

    return fa.body(this.context, ...values);
  }

  public visitAdded(fa: AddedFunctionAnnotation): Value {
    const guard = fa.guards.find(g => g.match(this.context));

    if (guard !== undefined) {
      return guard.body.visit(new EvalAstVisitor(this.context));
    }

    throw new Error(`Guard lookup failed`);
  }
}
