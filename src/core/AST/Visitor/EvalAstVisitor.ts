import { Value } from "..";
import { KugoError } from "../../..";
import { Maybe } from "../../../utils/Maybe";
import { ArgsTable } from "../../Context";
import { NCall } from "../NCall";
import { NConstant } from "../NConstant";
import { AstVisitor } from "./AstVisitor";
import { EvalFunctionAnnotationVisitor } from "./EvalFunctionAnnotationVisitor";

export class EvalAstVisitor extends AstVisitor<Maybe<Value>> {
  public visitInvocation({ name, args }: NCall): Maybe<Value> {
    const local = this.context.lookupLocal(name);
    if (local) {
      return Maybe.just(local);
    }

    const functionAnnotation = this.context.lookupFunction(name);
    if (functionAnnotation === undefined) {
      return Maybe.fail(new KugoError(`Unknown function ${name}`));
    }

    const builtArgs: ArgsTable = new Map();
    for (const [i, arg] of args.entries()) {
      const result = arg.visit(this);
      if (result.failed) {
        return Maybe.fail(result.errors);
      }
      result.with(val => builtArgs.set(functionAnnotation.args[i], val));
    }

    return functionAnnotation.visit(
      new EvalFunctionAnnotationVisitor(this.context.nest(builtArgs)),
    );
  }

  public visitConstant({ value }: NConstant): Maybe<Value> {
    return Maybe.just<Value>({ kind: "eval", value });
  }
}
