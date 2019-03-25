import { ArgsTable, Context } from "../Context";
import { MetaType } from "../Type/Meta";
import { FunctionAnnotation } from "./FunctionAnnotation";
import { AstVisitor } from "./Visitor/AstVisitor";
import { EvalFunctionAnnotationVisitor } from "./Visitor/EvalFunctionAnnotationVisitor";

export interface Arg {
  readonly name: string;
  readonly type: MetaType;
}
export type FunctionArgs = Arg[];

export type Value =
  | {
      kind: "eval";
      value: EvaluatedValue;
    }
  | {
      kind: "defer";
      fa: FunctionAnnotation;
      args: ArgsTable;
    };

// EXTRA: Move away from /AST
export const evaluate = (ctx: Context, value: Value): EvaluatedValue => {
  let i = 0;
  let step: Value = value;

  while (step.kind === "defer") {
    step = step.fa.visit(
      new EvalFunctionAnnotationVisitor(ctx.nest(step.args)),
    );
    i++;
  }

  return step.value;
};

export type DeferredValue = () => Value;
export type EvaluatedValue = number;

export abstract class NExpression {
  public abstract visit<T>(visitor: AstVisitor<T>): T;
}
