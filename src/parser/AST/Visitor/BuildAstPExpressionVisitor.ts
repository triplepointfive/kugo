import { NExpression } from "../../../core/AST";
import { FunctionType } from "../../../core/AST/FunctionAnnotation";
import { NCall } from "../../../core/AST/NCall";
import { NConstant } from "../../../core/AST/NConstant";
import { NGuard } from "../../../core/AST/NGuard";
import { Maybe } from "../../../utils/Maybe";
import { CallPExpression } from "../CallPExpression";
import { NumberPExpression } from "../NumberPExpression";
import { PGuard } from "../PGuard";
import { BuildNGuardVisitor } from "./BuildNGuardVisitor";
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
    return Maybe.just(new NConstant(value.value, value.type));
  }
}

// tslint:disable-next-line: max-classes-per-file
export class BuildGuardVisitor {
  constructor(
    protected readonly guard: PGuard,
    private readonly types: FunctionType[],
  ) {}

  public build(): Maybe<NGuard> {
    return this.guard.expression
      .visit(new BuildAstPExpressionVisitor())
      .map(body =>
        Maybe.just(
          new NGuard(
            this.guard.predicate.visit(new BuildNGuardVisitor()),
            body,
            this.types,
          ),
        ),
      );
  }
}
