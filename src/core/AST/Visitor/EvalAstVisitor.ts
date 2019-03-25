import { Value } from "..";
import { KugoError } from "../../..";
import { Maybe } from "../../../utils/Maybe";
import { ArgsTable } from "../../Context";
import { NCall } from "../NCall";
import { NConstant } from "../NConstant";
import { AstVisitor } from "./AstVisitor";
import { EvalFunctionAnnotationVisitor } from "./EvalFunctionAnnotationVisitor";

export class EvalAstVisitor extends AstVisitor<Value> {
  public visitInvocation({ name, args }: NCall): Value {
    const local = this.context.lookupLocal(name);
    if (local) {
      return local;
    }

    const functionAnnotation = this.context.lookupFunction(name);
    if (functionAnnotation === undefined) {
      throw new Error(`Unknown function ${name}`);
    }

    const builtArgs: ArgsTable = new Map();
    for (const [i, arg] of args.entries()) {
      const val = arg.visit(this);
      builtArgs.set(functionAnnotation.args[i], val);
    }

    return {
      args: builtArgs,
      fa: functionAnnotation,
      kind: "defer",
    };
  }

  public visitConstant({ value }: NConstant): Value {
    return { kind: "eval", value };
  }
}
