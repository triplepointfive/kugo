import { Arg, Body, FunctionArgs, Value } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { ArgsTable, Context, FunctionsTable } from "../../core/Context";
import { IMetaType } from "../../core/Type/Meta";
import { PExpression } from "./PExpression";

export class CallPExpression extends PExpression {
  constructor(
    public readonly name: string,
    public readonly args: PExpression[],
  ) {
    super();
  }

  public build(): Body {
    return (ctx: Context): Value | Error[] => {
      const localValue = ctx.lookupLocal(this.name);
      // TODO: Check this has no args
      if (localValue) {
        return localValue;
      }

      const ctxFunction = ctx.lookupFunction(this.name);

      if (ctxFunction) {
        const mValues = this.args.map(arg => arg.build()(ctx));
        let valueErrors: Error[] = [];
        const values: Value[] = [];

        mValues.forEach(val => {
          if (val instanceof Array) {
            valueErrors = valueErrors.concat(val);
          } else {
            values.push(val);
          }
        });

        if (valueErrors.length) {
          return valueErrors;
        }

        // TODO: Check sizes
        const local: ArgsTable = new Map(
          ctxFunction.args.map(
            ([name, _]: Arg, i: number): [string, Value] => {
              return [name, values[i]];
            },
          ),
        );
        return ctxFunction.body.eval(ctx.nest(local));
      }
      return [new Error(`Function ${this.name} not found`)];
    };
  }

  public type(ctx: Context, ext: FunctionsTable): IMetaType {
    const expFunctionAnnotation =
      ext.get(this.name) || ctx.lookupFunction(this.name);

    // TODO: Build error instead of throwing
    if (!expFunctionAnnotation) {
      throw new Error(`Failed to obtain type of ${this.name}`);
    }
    return expFunctionAnnotation.returnType;
  }

  public buildArgTypes(
    global: Context,
    module: FunctionsTable,
    functionArgs: FunctionArgs,
    annotation?: FunctionAnnotation,
    index?: number,
  ): void {
    if (annotation !== undefined && index !== undefined) {
      if (this.args.length === 0) {
        const type = functionArgs.find(([name, _]) => name === this.name);

        if (type) {
          // TODO: Intersect types here
          type[1].options = annotation.args[index][1].options;
        }
      }
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
