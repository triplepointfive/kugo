import { Body, IFunctionAnnotation, Value } from "./core/AST";
import { Context } from "./core/Context";
import { IntegerNumberInterval, IntegerNumberType } from "./core/Type/Meta";

const buildBody = (f: any, ...names: string[]): Body => {
  return (ctx: Context): Value | Error[] => {
    const missed: string[] = [];
    const values: Value[] = [];

    names.forEach((name) => {
      // TODO: Check whether it can be not-local
      const val = ctx.lookupLocal(name);

      if (val) {
        values.push(val);
      } else {
        missed.push(name);
      }
    });

    if (missed.length) {
      return missed.map((name) => new Error(`Function ${name} not found`));
    }

    return f.apply(null, values);
  };
};

const inf = { options: [new IntegerNumberType()] };

export const divBody: IFunctionAnnotation = {
  args: [
    ["a", inf],
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
  body: {
    eval: (ctx) =>
      buildBody((a: Value, b: Value) => Math.floor(a / b), "a", "b")(ctx),
  },
  returnType: inf,
};
export const substBody: IFunctionAnnotation = {
  args: [["a", inf], ["b", inf]],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a - b, "a", "b")(ctx),
  },
  returnType: inf,
};
export const sumBody: IFunctionAnnotation = {
  args: [["a", inf], ["b", inf]],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a + b, "a", "b")(ctx),
  },
  returnType: inf,
};
export const prodBody: IFunctionAnnotation = {
  args: [["a", inf], ["b", inf]],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a * b, "a", "b")(ctx),
  },
  returnType: inf,
};
export const absBody: IFunctionAnnotation = {
  args: [["v", inf]],
  body: { eval: (ctx) => buildBody((v: Value) => Math.abs(v), "v")(ctx) },
  returnType: {
    options: [
      new IntegerNumberType([new IntegerNumberInterval({ bottom: 0 })]),
    ],
  },
};

export const builtInFunctions: Map<string, IFunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody],
]);

export const builtInContext = new Context(builtInFunctions, new Map());
