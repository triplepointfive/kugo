import { Context } from "../Context";
import { Type } from "../Type";

export type Arg = [string, Type];

export type Value = number;
export type Body = (ctx: Context) => Value | Error[];

export interface INExpression {
  eval: Body;
}

export interface IFunctionAnnotation {
  args: Arg[];
  returnType: Type;
  body: INExpression;
}
