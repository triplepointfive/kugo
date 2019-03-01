import {
  AnyMetaType,
  CallPExpression,
  NumberPExpression,
  PFunctionDeclaration,
} from "../..";
import { Arg, FunctionArgs } from "../../core/AST";
import { Context } from "../../core/Context";
import { KugoError } from "../../core/KugoError";
import { MetaType } from "../../core/Type/Meta";
import { NeverMetaType } from "../../core/Type/Meta/NeverMetaType";
import { Maybe } from "../../utils/Maybe";
import { PExpressionVisitor } from "./PExpressionVisitor";

export class FunctionArgsPExpressionVisitor extends PExpressionVisitor<
  FunctionArgs
> {
  public static build(
    context: Context,
    functionDeclaration: PFunctionDeclaration,
  ): Maybe<FunctionArgs> {
    const args: FunctionArgs = functionDeclaration.expression.visit(
      new FunctionArgsPExpressionVisitor(context, functionDeclaration),
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
  }

  private args: FunctionArgs;
  private argType?: MetaType;

  protected constructor(
    private context: Context,
    { args }: PFunctionDeclaration,
  ) {
    super();

    this.args = args.map(
      (name: string): Arg => {
        return { name, type: new AnyMetaType() };
      },
    );
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
        this.argType = functionDeclaration.args[index].type;
        arg.visit(this);
      });
    }

    return this.args;
  }

  public visitValue(value: NumberPExpression): FunctionArgs {
    return this.args;
  }
}
