import { Context } from "../..";
import { KugoError } from "../../core/KugoError";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { CallPExpression } from "./CallPExpression";
import { NumberPExpression } from "./NumberPExpression";
import { PExpressionVisitor } from "./PExpressionVisitor";

export class ReturnTypePExpressionVisitor extends PExpressionVisitor<
  Maybe<MetaType>
> {
  constructor(private context: Context) {
    super();
  }

  public visitFunctionCall(functionCall: CallPExpression): Maybe<MetaType> {
    const definedFunction = this.context.lookupFunction(functionCall.name);
    if (definedFunction === undefined) {
      return Maybe.fail(
        new KugoError(`Function ${functionCall.name} is not found`),
      );
    }

    return Maybe.just(definedFunction.returnType);
  }

  public visitValue(value: NumberPExpression): Maybe<MetaType> {
    return value.type();
  }
}
