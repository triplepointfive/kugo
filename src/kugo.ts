import { Value } from "./core/AST";
import { BuiltInFunctionAnnotation } from "./core/AST/BuiltInFunctionAnnotation";
import { FunctionAnnotation } from "./core/AST/FunctionAnnotation";
import { Context } from "./core/Context";
import { IntegerNumberInterval } from "./core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "./core/Type/Integral/IntegerNumberType";
import { Natural0NumberType } from "./core/Type/Integral/Natural0NumberType";
import { UnionMetaType } from "./core/Type/Meta/UnionMetaType";

export const Z = new UnionMetaType([
  new IntegerNumberType([new IntegerNumberInterval()]),
]);

export const divBody = new BuiltInFunctionAnnotation(
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
  (a: Value, b: Value) => Math.floor(a / b),
);
export const substBody = new BuiltInFunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  (a: Value, b: Value) => a - b,
);
export const sumBody = new BuiltInFunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  (a: Value, b: Value) => a + b,
);
export const prodBody = new BuiltInFunctionAnnotation(
  [{ name: "a", type: Z }, { name: "b", type: Z }],
  Z,
  (a: Value, b: Value) => a * b,
);
export const absBody = new BuiltInFunctionAnnotation(
  [{ name: "v", type: Z }],
  new UnionMetaType([new Natural0NumberType()]),
  (v: Value) => Math.abs(v),
);

export const builtInFunctions: Map<string, FunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody],
]);

export const builtInContext = new Context(builtInFunctions, new Map());
