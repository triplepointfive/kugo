import { Body, FunctionArgs } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { Context, FunctionsTable } from "../../core/Context";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { PExpressionVisitor } from "./PExpressionVisitor";

export abstract class PExpression {
  public abstract build(): Body;

  public abstract type(ctx: Context, ext: FunctionsTable): Maybe<MetaType>;

  public abstract buildArgTypes(
    global: Context,
    module: FunctionsTable,
    functionArgs: FunctionArgs,
    annotation?: FunctionAnnotation,
    index?: number,
  ): void;

  public abstract visit<T>(visitor: PExpressionVisitor<T>): T;
}
