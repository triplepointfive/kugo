import { Context } from "../Context";
import { MetaType } from "../Type/Meta";

export type Arg = [string, MetaType];
export type FunctionArgs = Arg[];

export type Value = number;
export type Body = (ctx: Context) => Value | Error[];

export interface INExpression {
  eval: Body;
}
