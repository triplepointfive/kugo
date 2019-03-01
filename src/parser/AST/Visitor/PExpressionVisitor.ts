import { CallPExpression, NumberPExpression } from "../../..";

export abstract class PExpressionVisitor<T> {
  public abstract visitFunctionCall(functionCall: CallPExpression): T;
  public abstract visitValue(value: NumberPExpression): T;
}
