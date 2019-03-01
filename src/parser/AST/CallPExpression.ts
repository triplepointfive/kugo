import { Arg, Body, FunctionArgs, Value } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { ArgsTable, Context, FunctionsTable } from "../../core/Context";
import { KugoError } from "../../core/KugoError";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { PExpression } from "./PExpression";
import { PExpressionVisitor } from "./PExpressionVisitor";

export class CallPExpression extends PExpression {
  constructor(
    public readonly name: string,
    public readonly args: PExpression[],
  ) {
    super();
  }

  public build(): Body {
    return (ctx: Context): Maybe<Value> => {
      const localValue = ctx.lookupLocal(this.name);
      // TODO: Check this has no args
      if (localValue) {
        return Maybe.just(localValue);
      }

      const ctxFunction = ctx.lookupFunction(this.name);

      if (!ctxFunction) {
        return Maybe.fail(new KugoError(`Function ${this.name} not found`));
      }

      let argBuilds: Maybe<Value[]> = Maybe.just([]);

      this.args.forEach(arg => {
        argBuilds = argBuilds.map(builtArgs => {
          return arg
            .build()(ctx)
            .map(newArg => Maybe.just(builtArgs.concat([newArg])));
        });
      });

      return argBuilds.map(values => {
        // TODO: Check sizes
        const local: ArgsTable = new Map(
          ctxFunction.args.map(
            ({ name }: Arg, i: number): [string, Value] => {
              return [name, values[i]];
            },
          ),
        );

        return ctxFunction.body.eval(ctx.nest(local));
      });
    };
  }

  // TODO: Also typecheck here
  public type(ctx: Context, ext: FunctionsTable): Maybe<MetaType> {
    const expFunctionAnnotation =
      ext.get(this.name) || ctx.lookupFunction(this.name);

    if (!expFunctionAnnotation) {
      return Maybe.fail(new KugoError(`Failed to obtain type of ${this.name}`));
    }

    return Maybe.just(expFunctionAnnotation.returnType);
  }

  public visit<T>(visitor: PExpressionVisitor<T>): T {
    return visitor.visitFunctionCall(this);
  }

  public buildArgTypes(
    global: Context,
    module: FunctionsTable,
    functionArgs: FunctionArgs,
    annotation?: FunctionAnnotation,
    index?: number,
  ): void {
    if (
      annotation !== undefined &&
      index !== undefined &&
      this.args.length === 0
    ) {
      functionArgs.forEach(arg => {
        if (arg.name === this.name) {
          arg.type = arg.type.intersect(annotation.args[index].type);
        }
      });
    }

    const expFunctionAnnotation =
      global.lookupFunction(this.name) || module.get(this.name);

    // Shouldn't care if not found, type check will fail in another place
    if (expFunctionAnnotation) {
      this.args.forEach((arg, i) => {
        arg.buildArgTypes(
          global,
          module,
          functionArgs,
          expFunctionAnnotation,
          i,
        );
      });
    }
  }
}
