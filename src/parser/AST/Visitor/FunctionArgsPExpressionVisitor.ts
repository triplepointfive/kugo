import { concat, flatMap, reduce, uniqBy } from "lodash";
import {
  AnyMetaType,
  CallPExpression,
  NumberPExpression,
  PFunctionDeclaration,
} from "../../..";
import { Arg, FunctionArgs } from "../../../core/AST";
import { Context } from "../../../core/Context";
import { MetaType } from "../../../core/Type/Meta";
import { Maybe } from "../../../utils/Maybe";
import { PGuard } from "../PGuard";
import { PExpressionVisitor } from "./PExpressionVisitor";

export function buildArgs(
  context: Context,
  functionDeclaration: PFunctionDeclaration,
  guard: PGuard,
): Maybe<FunctionArgs[]> {
  const initArgs = functionDeclaration.args.map(
    (name: string, i: number): Arg => {
      return { name, type: new AnyMetaType(i) };
    },
  );

  return guard.predicate.restrictArgs(initArgs).map(restrictedArgs => {
    const args = guard.expression.visit(
      new FunctionArgsPExpressionVisitor(context, restrictedArgs),
    );

    // TODO: Check invalid types better
    // TODO: Add checks

    // TODO: Do it more accurate
    return Maybe.just(
      uniqBy(args, arg => arg.map(a => a.type.display()).join(" ")),
    );
  });
}

class FunctionArgsPExpressionVisitor extends PExpressionVisitor<
  FunctionArgs[]
> {
  constructor(
    private readonly context: Context,
    private readonly args: FunctionArgs,
    private readonly argType?: MetaType,
  ) {
    super();
  }

  public visitFunctionCall(call: CallPExpression): FunctionArgs[] {
    let restrictedArgs: FunctionArgs = this.args;

    if (call.args.length === 0) {
      restrictedArgs = this.args.map(({ name, type }) => {
        if (name === call.name && this.argType !== undefined) {
          return { name, type: type.intersect(this.argType) };
        }

        return { name, type };
      });
    }

    const functionAnnotation = this.context.lookupFunction(call.name);

    if (functionAnnotation === undefined) {
      return [restrictedArgs];
    }

    let callTypesArgs: FunctionArgs[] = [];

    functionAnnotation.types().forEach(types => {
      callTypesArgs = concat(
        callTypesArgs,
        reduce(
          call.args,
          (opts, arg, index) =>
            flatMap(opts, opt =>
              arg.visit(
                new FunctionArgsPExpressionVisitor(
                  this.context,
                  opt,
                  types.args[index],
                ),
              ),
            ),
          [restrictedArgs],
        ),
      );
    });

    return callTypesArgs;
  }

  public visitValue(value: NumberPExpression): FunctionArgs[] {
    return [this.args];
  }
}
