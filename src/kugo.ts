import { Value } from "./core/AST";
import { BuiltInFunctionAnnotation } from "./core/AST/BuiltInFunctionAnnotation";
import {
  FunctionAnnotation,
  FunctionType,
} from "./core/AST/FunctionAnnotation";
import { Context } from "./core/Context";
import { IntegerNumberType } from "./core/Type/Integral/IntegerNumberType";
import { UnionMetaType } from "./core/Type/Meta/UnionMetaType";

export const Z = new UnionMetaType([new IntegerNumberType()]);

export const divBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [
    new FunctionType(
      [Z, new UnionMetaType([new IntegerNumberType({ upper: -1 })])],
      Z,
    ),
    new FunctionType(
      [Z, new UnionMetaType([new IntegerNumberType({ bottom: 1 })])],
      Z,
    ),
  ],
  (a: Value, b: Value) => Math.floor(a / b),
);
export const substBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  (a: Value, b: Value) => a - b,
);
export const sumBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  (a: Value, b: Value) => a + b,
);
export const prodBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  (a: Value, b: Value) => a * b,
);
export const absBody = new BuiltInFunctionAnnotation(
  ["v"],
  [
    new FunctionType(
      [Z],
      new UnionMetaType([new IntegerNumberType({ bottom: 0 })]),
    ),
  ],
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
