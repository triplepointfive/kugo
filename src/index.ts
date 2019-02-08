import { NumberBound, NumberInterval } from "./core/Type"
import { FunctionAnnotation, Value } from "./core/AST"

const inf: NumberBound = { type: "infinity" },
  inc = (v: number): NumberBound => {
    return { type: "inclusive", value: v }
  },
  exc = (v: number): NumberBound => {
    return { type: "exclusive", value: v }
  }

const divBody: FunctionAnnotation = {
    args: [
      ["a", [new NumberInterval(inf, inf)]],
      ["b", [new NumberInterval(inf, exc(0)), new NumberInterval(exc(0), inf)]]
    ],
    returnType: [new NumberInterval(inf, inf)],
    body: (a: Value, b: Value) => a / b
  },
  absBody: FunctionAnnotation = {
    args: [["v", [new NumberInterval(inf, inf)]]],
    returnType: [new NumberInterval(inc(0), inf)],
    body: (v: Value) => Math.abs(v)
  }

export const builtInFunctions: Map<string, FunctionAnnotation> = new Map([
  ["div", divBody],
  ["abs", absBody]
])
