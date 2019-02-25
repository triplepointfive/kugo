import { Body } from "../../core/AST";
import { Context, FunctionsTable } from "../../core/Context";
import { IMetaType } from "../../core/Type/Meta";

export abstract class PExpression {
  public abstract build(): Body;
  public abstract type(buildCtx: Context, ext: FunctionsTable): IMetaType;
}
