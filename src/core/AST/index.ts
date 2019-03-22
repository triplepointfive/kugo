import { MetaType } from "../Type/Meta";
import { AstVisitor } from "./Visitor/AstVisitor";

export interface Arg {
  readonly name: string;
  readonly type: MetaType;
}
export type FunctionArgs = Arg[];

export interface Value {
  kind: "eval";
  value: EvaluatedValue;
}

export const evaluate = (value: Value): EvaluatedValue => {
  return value.value;
};

export type DeferredValue = () => Value;
export type EvaluatedValue = number;

export abstract class NExpression {
  public abstract visit<T>(visitor: AstVisitor<T>): T;
}
