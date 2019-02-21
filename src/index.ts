import { NumberBound, NumberInterval } from "./core/Type"
import { FunctionAnnotation, Value, Body } from "./core/AST"
import { Context } from "./core/Context"

export const inf: NumberBound = { type: "infinity" },
  inc = (v: number): NumberBound => {
    return { type: "inclusive", value: v }
  },
  exc = (v: number): NumberBound => {
    return { type: "exclusive", value: v }
  }

const buildBody = function(f: any, ...names: string[]): Body {
  return function(ctx: Context): Value | Error[] {
    let missed: string[] = [],
      values: Value[] = []

    names.forEach(name => {
      // TODO: Check whether it can be not-local
      let val = ctx.lookupLocal(name)

      if (val) {
        values.push(val)
      } else {
        missed.push(name)
      }
    })

    if (missed.length) {
      return missed.map(name => new Error(`Function ${name} not found`))
    }

    return f.apply(null, values)
  }
}

export const divBody: FunctionAnnotation = {
    args: [
      ["a", [new NumberInterval(inf, inf)]],
      ["b", [new NumberInterval(inf, exc(0)), new NumberInterval(exc(0), inf)]]
    ],
    returnType: [new NumberInterval(inf, inf)],
    body: {
      eval: ctx =>
        buildBody((a: Value, b: Value) => Math.floor(a / b), "a", "b")(ctx)
    }
  },
  substBody: FunctionAnnotation = {
    args: [
      ["a", [new NumberInterval(inf, inf)]],
      ["b", [new NumberInterval(inf, inf)]]
    ],
    returnType: [new NumberInterval(inf, inf)],
    body: {
      eval: ctx => buildBody((a: Value, b: Value) => a - b, "a", "b")(ctx)
    }
  },
  sumBody: FunctionAnnotation = {
    args: [
      ["a", [new NumberInterval(inf, inf)]],
      ["b", [new NumberInterval(inf, inf)]]
    ],
    returnType: [new NumberInterval(inf, inf)],
    body: {
      eval: ctx => buildBody((a: Value, b: Value) => a + b, "a", "b")(ctx)
    }
  },
  prodBody: FunctionAnnotation = {
    args: [
      ["a", [new NumberInterval(inf, inf)]],
      ["b", [new NumberInterval(inf, inf)]]
    ],
    returnType: [new NumberInterval(inf, inf)],
    body: {
      eval: ctx => buildBody((a: Value, b: Value) => a * b, "a", "b")(ctx)
    }
  },
  absBody: FunctionAnnotation = {
    args: [["v", [new NumberInterval(inf, inf)]]],
    returnType: [new NumberInterval(inc(0), inf)],
    body: { eval: ctx => buildBody((v: Value) => Math.abs(v), "v")(ctx) }
  }

export const builtInFunctions: Map<string, FunctionAnnotation> = new Map([
  ["sum", sumBody],
  ["prod", prodBody],
  ["subst", substBody],
  ["div", divBody],
  ["abs", absBody]
])

export const builtInContext = new Context(builtInFunctions, new Map())
