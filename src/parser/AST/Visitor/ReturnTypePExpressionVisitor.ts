import { reduce } from "lodash";
import { Context } from "../../..";
import { FunctionArgs } from "../../../core/AST";
import { KugoError } from "../../../core/KugoError";
import { MetaType } from "../../../core/Type/Meta";
import { Maybe } from "../../../utils/Maybe";
import { CallPExpression } from "../CallPExpression";
import { NumberPExpression } from "../NumberPExpression";
import { PExpressionVisitor } from "./PExpressionVisitor";

export class ReturnTypePExpressionVisitor extends PExpressionVisitor<
  Maybe<MetaType>
> {
  constructor(private context: Context, private args: FunctionArgs) {
    super();
  }

  public visitFunctionCall(functionCall: CallPExpression): Maybe<MetaType> {
    const definedFunction = this.context.lookupFunction(functionCall.name);
    if (definedFunction === undefined) {
      const arg = this.args.find(({ name }) => name === functionCall.name);
      if (arg) {
        return Maybe.just(arg.type);
      }

      return Maybe.fail(
        new KugoError(`Function ${functionCall.name} is not found`),
      );
    }

    // TODO: Filter types with input args
    // TODO: Remove duplicity
    const resultType = reduce(
      definedFunction.types().map(({ result }) => result),
      (acc, result) => acc.union(result),
    );

    if (resultType === undefined) {
      return Maybe.fail(
        new KugoError(`Function ${functionCall.name} has no return types`),
      );
    }
    return Maybe.just(resultType);
  }

  public visitValue(value: NumberPExpression): Maybe<MetaType> {
    return Maybe.just(value.type);
  }
}
