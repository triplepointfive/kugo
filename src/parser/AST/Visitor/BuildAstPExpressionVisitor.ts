import { NExpression } from "../../../core/AST";
import { NCall } from "../../../core/AST/NCall";
import { NConstant } from "../../../core/AST/NConstant";
import { Maybe } from "../../../utils/Maybe";
import { CallPExpression } from "../CallPExpression";
import { NumberPExpression } from "../NumberPExpression";
import { PExpressionVisitor } from "./PExpressionVisitor";

export class BuildAstPExpressionVisitor extends PExpressionVisitor<
  Maybe<NExpression>
> {
  public visitFunctionCall(functionCall: CallPExpression): Maybe<NExpression> {
    const args: NExpression[] = [];

    for (const arg of functionCall.args) {
      const builtNode = arg.visit(this);

      if (builtNode.failed) {
        return Maybe.fail(builtNode.errors);
      }

      builtNode.with(node => args.push(node));
    }

    return Maybe.just(new NCall(functionCall.name, args));
  }

  public visitValue(value: NumberPExpression): Maybe<NExpression> {
    return value
      .type()
      .map(type => Maybe.just(new NConstant(value.value, type)));
  }
}
