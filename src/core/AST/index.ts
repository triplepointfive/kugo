import { Context } from "../Context";
import { KugoError } from "../KugoError";
import { MetaType } from "../Type/Meta";

export type Arg = [string, MetaType];
export type FunctionArgs = Arg[];

export type Value = number;
export type Body = (ctx: Context) => Value | KugoError[];

export interface INExpression {
  eval: Body;
}
