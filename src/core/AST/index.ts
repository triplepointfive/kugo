import { MetaType } from "../Type/Meta";
import { AstVisitor } from "./Visitor/AstVisitor";

export interface Arg {
  name: string;
  type: MetaType;
}
export type FunctionArgs = Arg[];

export type Value = number;

export abstract class NExpression {
  public abstract visit<T>(visitor: AstVisitor<T>): T;
}
