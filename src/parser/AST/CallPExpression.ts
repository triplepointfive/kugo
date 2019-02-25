import { Arg, Body, Value } from "../../core/AST";
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
  public type(buildCtx: Context, ext: FunctionsTable): IMetaType {
    // TODO: Reuse this lower when building body
    const expFunctionAnnotation =
      ext.get(this.name) || buildCtx.lookupFunction(this.name);
    // TODO: Build error instead of throwing
    if (!expFunctionAnnotation) {
      throw new Error(`Failed to obtain type of ${this.name}`);
    }
    return expFunctionAnnotation.returnType;
  }
}
