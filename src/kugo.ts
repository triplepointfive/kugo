import { EvaluatedValue, Value } from "./core/AST";
import { BuiltInFunctionAnnotation } from "./core/AST/BuiltInFunctionAnnotation";
import {
  FunctionAnnotation,
  FunctionType,
} from "./core/AST/FunctionAnnotation";
import { Context } from "./core/Context";
import { IntegerNumberType } from "./core/Type/Integral/IntegerNumberType";
import { AnyMetaType } from "./core/Type/Meta/AnyMetaType";
import { UnionMetaType } from "./core/Type/Meta/UnionMetaType";

export const Z = new UnionMetaType([new IntegerNumberType()]);

const evalV = (
  f: (...args: EvaluatedValue[]) => EvaluatedValue,
): ((...args: Value[]) => Value) => {
  return (...args: Value[]): Value => {
    const evaluatedArgs: EvaluatedValue[] = args.map(arg => {
      const value = arg;

      // TODO: while (value.kind !== "eval") {}

      return value.value;
    });

    return { kind: "eval", value: f(...evaluatedArgs) };
  };
};

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
  evalV((a: EvaluatedValue, b: EvaluatedValue) => Math.floor(a / b)),
);

export const substBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  evalV((a: EvaluatedValue, b: EvaluatedValue) => a - b),
);

export const sumBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  evalV((a: EvaluatedValue, b: EvaluatedValue) => a + b),
);

export const prodBody = new BuiltInFunctionAnnotation(
  ["a", "b"],
  [new FunctionType([Z, Z], Z)],
  evalV((a: EvaluatedValue, b: EvaluatedValue) => a * b),
);

export const absBody = new BuiltInFunctionAnnotation(
  ["v"],
  [
    new FunctionType(
      [Z],
      new UnionMetaType([new IntegerNumberType({ bottom: 0 })]),
    ),
  ],
  evalV((v: EvaluatedValue) => Math.abs(v)),
);

export const failBody = new BuiltInFunctionAnnotation(
  ["a"],
  [new FunctionType([new AnyMetaType(0)], new AnyMetaType(1))],
  () => {
    throw new Error("Fail");
  },
);

export const builtInFunctions: Map<string, FunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody],
  ["fail", failBody],
]);

export const builtInContext = new Context(builtInFunctions, new Map());
