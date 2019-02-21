import { inf } from "..";
import { IPApp, IPExpression } from "../parser/AST";
import { Arg, Body, IFunctionAnnotation, INExpression, Value } from "./AST";
import { INumberInterval } from "./Type";

export type FunctionsTable = Map<string, IFunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

export class Context {
  constructor(
    private readonly global: FunctionsTable,
    private readonly local: ArgsTable,
  ) { }

  public extend(pApp: IPApp): Context {
    const ext: FunctionsTable = new Map();

    // TODO: Build and check types
    const type = [new INumberInterval(inf, inf)];

    // TODO: Allow to use not yet defined function
    pApp.functionDeclarations.forEach((fd) => {
      if (this.lookupFunction(fd.name)) {
        // TODO throw already defined
      }

      const a: IFunctionAnnotation = {
        args: fd.args.map((name: string): Arg => [name, type]),
        body: { eval: buildBody(fd.expression) },
        returnType: type,
      };

      ext.set(fd.name, a);
    });

    return new Context(new Map([...this.global, ...ext]), this.local);
  }

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public evaluate(expression: INExpression): Value | Error[] {
    return expression.eval(this);
  }

  public lookupFunction(name: string): IFunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name);
  }
}

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
