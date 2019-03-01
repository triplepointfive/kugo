import { Maybe } from "../../utils/Maybe";
import { Context } from "../Context";
import { MetaType } from "../Type/Meta";

export interface Arg {
  name: string;
  type: MetaType;
}
export type FunctionArgs = Arg[];

export type Value = number;
export type Body = (ctx: Context) => Maybe<Value>;

export interface NExpression {
  eval: Body;
}
