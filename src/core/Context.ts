import { IPApp, IPExpression } from "../parser/AST";
import { Arg, Body, IFunctionAnnotation, INExpression, Value } from "./AST";
import { IMetaType } from "./Type/Meta";
import { IntegerNumberType } from "./Type/Integral/IntegerNumberType";
import { IntegerNumberInterval } from "./Type/Integral/IntegerNumberInterval";

export type FunctionsTable = Map<string, IFunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

export class Context {
  constructor(
    public readonly global: FunctionsTable,
    public readonly local: ArgsTable,
  ) {}

  public extend(pApp: IPApp): Context {
    const ext: FunctionsTable = new Map();

    // TODO: Build and check types
    const type: IMetaType = { options: [] };

    // TODO: Allow to use not yet defined function
    pApp.functionDeclarations.forEach(fd => {
      if (this.lookupFunction(fd.name)) {
        // TODO throw already defined
      }

      // TODO: Sadly, context required here to determine ret type
      const [body, returnType] = buildBody(this, ext, fd.expression);

      const a: IFunctionAnnotation = {
        args: fd.args.map((name: string): Arg => [name, type]),
        body: { eval: body },
        returnType: returnType,
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

const buildBody = (
  buildCtx: Context,
  ext: FunctionsTable,
  exp: IPExpression,
): [Body, IMetaType] => {
  if (exp.type === "number") {
    return [
      (ctx: Context): Value | Error[] => {
        return exp.value;
      },
      {
        options: [
          new IntegerNumberType([
            new IntegerNumberInterval({ bottom: exp.value, upper: exp.value }),
          ]),
        ],
      },
    ];
  }

  // TODO: Reuse this lower when building body
  const expFunctionAnnotation =
    ext.get(exp.name) || buildCtx.lookupFunction(exp.name);

  if (!expFunctionAnnotation) {
    console.trace();
    throw `Failed to obtain type of ${exp.name}`;
  }

  return [
    (ctx: Context): Value | Error[] => {
      const localValue = ctx.lookupLocal(exp.name);

      // TODO: Check exp has no args
      if (localValue) {
        return localValue;
      }

      const ctxFunction = ctx.lookupFunction(exp.name);

      if (ctxFunction) {
        const mValues = exp.args.map(arg =>
          buildBody(buildCtx, buildCtx.global, arg)[0](ctx),
        );

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

      return [new Error(`Function ${exp.name} not found`)];
    },
    expFunctionAnnotation.returnType,
  ];
};
