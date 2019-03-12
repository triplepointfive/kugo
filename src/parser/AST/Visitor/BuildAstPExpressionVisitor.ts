import { NExpression } from "../../../core/AST";
import { NCall } from "../../../core/AST/NCall";
import { NConstant } from "../../../core/AST/NConstant";
import {
  ConditionNGuard,
  EmptyNGuard,
  EqualNPredicate,
  NGuard,
} from "../../../core/AST/NGuard";
import { Maybe } from "../../../utils/Maybe";
import { CallPExpression } from "../CallPExpression";
import { NumberPExpression } from "../NumberPExpression";
import { ConditionPGuard, EqualPPredicate, PGuard } from "../PGuard";
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

// tslint:disable-next-line: max-classes-per-file
export class BuildGuardVisitor {
  constructor(protected readonly guard: PGuard) {}

  public build(): Maybe<NGuard> {
    if (this.guard instanceof ConditionPGuard) {
      if (!(this.guard.predicate instanceof EqualPPredicate)) {
        console.log(this.guard);
        throw new Error("Implement visitor!");
      }

      const { variable, value } = this.guard.predicate;

      return this.guard.expression
        .visit(new BuildAstPExpressionVisitor())
        .map(body =>
          value
            .type()
            .map(type =>
              Maybe.just(
                new ConditionNGuard(
                  new EqualNPredicate(
                    variable,
                    new NConstant(value.value, type),
                  ),
                  body,
                ),
              ),
            ),
        );
    }

    return this.guard.expression
      .visit(new BuildAstPExpressionVisitor())
      .map(body => Maybe.just(new EmptyNGuard(body)));
  }
}
