import { inf } from "..";
import { IPApp, IPExpression } from "../parser/AST";
import { ArgsTable, Context, FunctionsTable } from "./Context";
import { INumberInterval, Type } from "./Type";

export type Arg = [string, Type];

export type Value = number;
export type Body = (ctx: Context) => Value | Error[];

export interface INExpression {
  eval: Body;
}

export class NConstant implements INExpression {
  constructor(public readonly value: Value, public readonly type: Type) { }

  public eval(context: Context): Value | Error[] {
    return this.value;
  }
}

export class NCall implements INExpression {
  constructor(
    public readonly name: string,
    public readonly args: [INExpression],
  ) { }

  public eval(context: Context): Value | Error[] {
    return context.lookupLocal(this.name) || this.buildMethod(context);
  }

  private buildMethod(context: Context): Value | Error[] {
    const functionAnnotation = context.lookupFunction(this.name);
    if (functionAnnotation === undefined) {
      return [new Error(`Unknown function ${this.name}`)];
    }

    return functionAnnotation.body.eval(context);
  }
}

export interface IFunctionAnnotation {
  args: Arg[];
  returnType: Type;
  body: INExpression;
}

export const buildAst = (context: Context, pApp: IPApp): Context => {
  const ext: FunctionsTable = new Map();

  // TODO: Build and check types
  const type = [new INumberInterval(inf, inf)];

  // TODO: Allow to use not yet defined function
  pApp.functionDeclarations.forEach((fd) => {
    if (context.lookupFunction(fd.name)) {
      // TODO throw already defined
    }

    const a: IFunctionAnnotation = {
      args: fd.args.map((name: string): Arg => [name, type]),
      body: { eval: buildBody(fd.expression) },
      returnType: type,
    };

    ext.set(fd.name, a);
  });

  return context.extend(ext);
};

const buildBody = (exp: IPExpression): Body => {
  return (ctx: Context): Value | Error[] => {
    switch (exp.type) {
      case "number":
        return exp.value;
      case "call":
        const localValue = ctx.lookupLocal(exp.name);

        // TODO: Check exp has no args
        if (localValue) {
          return localValue;
        }

        const ctxFunction = ctx.lookupFunction(exp.name);

        if (ctxFunction) {
          const mValues = exp.args.map((arg) => buildBody(arg)(ctx));

          let valueErrors: Error[] = [];
          const values: Value[] = [];

          mValues.forEach((val) => {
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

        return [new Error(`Function ${exp.name} not found`)];
    }
  };
};
