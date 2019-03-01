import { Context, FunctionsTable } from "../../core/Context";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export abstract class PExpression {
  public abstract type(ctx: Context, ext: FunctionsTable): Maybe<MetaType>;

  public abstract visit<T>(visitor: PExpressionVisitor<T>): T;
}
