import { Maybe } from "../../utils/Maybe";
import { Context } from "../Context";
import { MetaType } from "../Type/Meta";

export type Arg = [string, MetaType];
export type FunctionArgs = Arg[];

export type Value = number;
export type Body = (ctx: Context) => Maybe<Value>;

export interface INExpression {
  eval: Body;
}
