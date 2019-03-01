import { Body, Value } from "./core/AST";
import { FunctionAnnotation } from "./core/AST/FunctionAnnotation";
import { Context } from "./core/Context";
import { KugoError } from "./core/KugoError";
import { IntegerNumberInterval } from "./core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "./core/Type/Integral/IntegerNumberType";
import { Natural0NumberType } from "./core/Type/Integral/Natural0NumberType";
import { UnionMetaType } from "./core/Type/Meta/UnionMetaType";
import { Maybe } from "./utils/Maybe";

const buildBody = (f: any, ...names: string[]): Body => {
  return (ctx: Context): Maybe<Value> => {
    const missed: string[] = [];
    const values: Value[] = [];

    names.forEach(name => {
      // TODO: Check whether it can be not-local
      const val = ctx.lookupLocal(name);

      if (val !== undefined) {
        values.push(val);
      } else {
        missed.push(name);
      }
    });

    if (missed.length) {
      return Maybe.fail(
        missed.map(name => new KugoError(`Function ${name} not found`)),
      );
    }

    return Maybe.just(f(...values));
  };
};

export const Z = new UnionMetaType([
  new IntegerNumberType([new IntegerNumberInterval()]),
]);

export const divBody: FunctionAnnotation = new FunctionAnnotation(
  [
    { name: "a", type: Z },
    {
      name: "b",
      type: new UnionMetaType([
        new IntegerNumberType([
          new IntegerNumberInterval({ upper: -1 }),
          new IntegerNumberInterval({ bottom: 1 }),
        ]),
      ]),
    },
  ],
  Z,
  {
    eval: ctx =>
      buildBody((a: Value, b: Value) => Math.floor(a / b), "a", "b")(ctx),
  },
);
export const substBody: FunctionAnnotation = new FunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a - b, "a", "b")(ctx),
  },
);
export const sumBody: FunctionAnnotation = new FunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a + b, "a", "b")(ctx),
  },
);
export const prodBody: FunctionAnnotation = new FunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a * b, "a", "b")(ctx),
  },
);
export const absBody: FunctionAnnotation = new FunctionAnnotation(
  [{ name: "v", type: Z }],
  new UnionMetaType([new Natural0NumberType()]),
  { eval: ctx => buildBody((v: Value) => Math.abs(v), "v")(ctx) },
);

export const builtInFunctions: Map<string, FunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody],
]);

export const builtInContext = new Context(builtInFunctions, new Map());
