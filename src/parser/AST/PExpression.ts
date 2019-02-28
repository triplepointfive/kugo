import { Body, FunctionArgs } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { Context, FunctionsTable } from "../../core/Context";
import { KugoError } from "../../core/KugoError";
import { MetaType } from "../../core/Type/Meta";

export abstract class PExpression {
  public abstract build(): Body;

  public abstract type(
    ctx: Context,
    ext: FunctionsTable,
  ): MetaType | KugoError[];

  public abstract buildArgTypes(
    global: Context,
    module: FunctionsTable,
    functionArgs: FunctionArgs,
    annotation?: FunctionAnnotation,
    index?: number,
  ): void;
}
