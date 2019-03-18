import {
  AnyMetaType,
  CallPExpression,
  NumberPExpression,
  PFunctionDeclaration,
} from "../../..";
import { Arg, FunctionArgs } from "../../../core/AST";
import { Context } from "../../../core/Context";
import { KugoError } from "../../../core/KugoError";
import { MetaType } from "../../../core/Type/Meta";
import { NeverMetaType } from "../../../core/Type/Meta/NeverMetaType";
import { Maybe } from "../../../utils/Maybe";
import { PGuard } from "../PGuard";
import { PExpressionVisitor } from "./PExpressionVisitor";

export function buildArgs(
  context: Context,
  functionDeclaration: PFunctionDeclaration,
  guard: PGuard,
): Maybe<FunctionArgs> {
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
    const neverArgs = args.filter(({ type }) => type instanceof NeverMetaType);

    if (neverArgs.length) {
      return Maybe.fail(
        neverArgs.map(
          ({ name, type }) =>
            new KugoError(
              `${
                functionDeclaration.name
              }: argument ${name} has type ${type.display()}`,
            ),
        ),
      );
    }

    return Maybe.just(args);
  });
}

class FunctionArgsPExpressionVisitor extends PExpressionVisitor<FunctionArgs> {
  private argType?: MetaType;

  constructor(private context: Context, private args: FunctionArgs) {
    super();
  }

  public visitFunctionCall({ name, args }: CallPExpression): FunctionArgs {
    if (this.argType !== undefined && args.length === 0) {
      for (const arg of this.args) {
        if (arg.name === name) {
          arg.type = arg.type.intersect(this.argType);
        }
      }
    }

    const functionDeclaration = this.context.lookupFunction(name);
    if (functionDeclaration) {
      args.forEach((arg, index) => {
        // TODO: Rethink what to do here
        functionDeclaration.types.forEach(types => {
          this.argType = types.args[index];
          arg.visit(this);
        });
      });
    }

    return this.args;
  }

  public visitValue(value: NumberPExpression): FunctionArgs {
    return this.args;
  }
}
