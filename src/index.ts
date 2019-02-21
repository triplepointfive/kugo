import { Body, IFunctionAnnotation, Value } from "./core/AST";
import { Context } from "./core/Context";
import { INumberBound, NumberInterval } from "./core/Type";

export const inf: INumberBound = { type: "infinity" };
export const inc = (v: number): INumberBound => {
  return { type: "inclusive", value: v };
};
export const exc = (v: number): INumberBound => {
  return { type: "exclusive", value: v };
};

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

export const divBody: IFunctionAnnotation = {
  args: [
    ["a", [new NumberInterval(inf, inf)]],
    ["b", [new NumberInterval(inf, exc(0)), new NumberInterval(exc(0), inf)]],
  ],
  body: {
    eval: (ctx) =>
      buildBody((a: Value, b: Value) => Math.floor(a / b), "a", "b")(ctx),
  },
  returnType: [new NumberInterval(inf, inf)],
};
export const substBody: IFunctionAnnotation = {
  args: [
    ["a", [new NumberInterval(inf, inf)]],
    ["b", [new NumberInterval(inf, inf)]],
  ],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a - b, "a", "b")(ctx),
  },
  returnType: [new NumberInterval(inf, inf)],
};
export const sumBody: IFunctionAnnotation = {
  args: [
    ["a", [new NumberInterval(inf, inf)]],
    ["b", [new NumberInterval(inf, inf)]],
  ],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a + b, "a", "b")(ctx),
  },
  returnType: [new NumberInterval(inf, inf)],
};
export const prodBody: IFunctionAnnotation = {
  args: [
    ["a", [new NumberInterval(inf, inf)]],
    ["b", [new NumberInterval(inf, inf)]],
  ],
  body: {
    eval: (ctx) => buildBody((a: Value, b: Value) => a * b, "a", "b")(ctx),
  },
  returnType: [new NumberInterval(inf, inf)],
};
export const absBody: IFunctionAnnotation = {
  args: [["v", [new NumberInterval(inf, inf)]]],
  body: { eval: (ctx) => buildBody((v: Value) => Math.abs(v), "v")(ctx) },
  returnType: [new NumberInterval(inc(0), inf)],
};

export const builtInFunctions: Map<string, IFunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody],
]);

export const builtInContext = new Context(builtInFunctions, new Map());
