import { Context } from "../Context";
import { IMetaType } from "../Type/Meta";

export type Arg = [string, IMetaType];

export type Value = number;
export type Body = (ctx: Context) => Value | Error[];

export interface INExpression {
  eval: Body;
}
