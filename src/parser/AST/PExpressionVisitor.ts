import { CallPExpression } from "./CallPExpression";
import { NumberPExpression } from "./NumberPExpression";

export abstract class PExpressionVisitor<T> {
  public abstract visitFunctionCall(functionCall: CallPExpression): T;
  public abstract visitValue(value: NumberPExpression): T;
}
