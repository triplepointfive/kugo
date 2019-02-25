import { Body, Value } from "./core/AST";
import { FunctionAnnotation } from "./core/AST/FunctionAnnotation";
import { Context } from "./core/Context";
import { IntegerNumberInterval } from "./core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "./core/Type/Integral/IntegerNumberType";
import { Natural0NumberType } from "./core/Type/Integral/Natural0NumberType";

const buildBody = (f: any, ...names: string[]): Body => {
  return (ctx: Context): Value | Error[] => {
    const missed: string[] = [];
    const values: Value[] = [];

    names.forEach(name => {
      // TODO: Check whether it can be not-local
      const val = ctx.lookupLocal(name);

      if (val) {
        values.push(val);
      } else {
        missed.push(name);
      }
    });

    if (missed.length) {
      return missed.map(name => new Error(`Function ${name} not found`));
    }

    return f.apply(null, values);
  };
};

export const Z = { options: [new IntegerNumberType()] };

export const divBody: FunctionAnnotation = new FunctionAnnotation(
  [
    ["a", Z],
    [
      "b",
      {
        options: [
          new IntegerNumberType([
            new IntegerNumberInterval({ upper: -1 }),
            new IntegerNumberInterval({ bottom: 1 }),
          ]),
        ],
      },
    ],
  ],
  Z,
  {
    eval: ctx =>
      buildBody((a: Value, b: Value) => Math.floor(a / b), "a", "b")(ctx),
  },
);
export const substBody: FunctionAnnotation = new FunctionAnnotation(
  [["a", Z], ["b", Z]],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a - b, "a", "b")(ctx),
  },
);
export const sumBody: FunctionAnnotation = new FunctionAnnotation(
  [["a", Z], ["b", Z]],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a + b, "a", "b")(ctx),
  },
);
export const prodBody: FunctionAnnotation = new FunctionAnnotation(
  [["a", Z], ["b", Z]],
  Z,
  {
    eval: ctx => buildBody((a: Value, b: Value) => a * b, "a", "b")(ctx),
  },
);
export const absBody: FunctionAnnotation = new FunctionAnnotation(
  [["v", Z]],
  {
    options: [new Natural0NumberType()],
  },
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
