export type NumberBound =
  | { readonly type: "inclusive" | "exclusive"; readonly value: number }
  | { readonly type: "infinity" }

export interface NumberInterval {
  readonly bottom: NumberBound
  readonly upper: NumberBound
}

// Min is only affecting positive infinity
const min = function(a: NumberBound, b: NumberBound): NumberBound {
  if (a.type === "infinity") {
    return b
  }

  if (b.type === "infinity") {
    return a
  }

  if (a.value === b.value) {
    return {
      type:
        a.type == "exclusive" || b.type == "exclusive"
          ? "exclusive"
          : "inclusive",
      value: a.value
    }
  }

  if (a.value < b.value) {
    return a
  } else {
    return b
  }
}

// Max is only affecting negative infinity
const max = function(a: NumberBound, b: NumberBound): NumberBound {
  if (a.type === "infinity") {
    return b
  }

  if (b.type === "infinity") {
    return a
  }

  if (a.value === b.value) {
    return {
      type:
        a.type == "exclusive" && b.type == "exclusive"
          ? "exclusive"
          : "inclusive",
      value: a.value
    }
  }

  if (a.value > b.value) {
    return a
  } else {
    return b
  }
}

export class NumberInterval {
  constructor(
    public readonly bottom: NumberBound,
    public readonly upper: NumberBound
  ) {}

  public get isUniversal(): boolean {
    return this.negativeInf && this.positiveInf
  }

  public get negativeInf(): boolean {
    return this.bottom.type === "infinity"
  }

  public get positiveInf(): boolean {
    return this.upper.type === "infinity"
  }

  public intersection(interval: NumberInterval): NumberInterval | undefined {
    let a = max(this.bottom, interval.bottom),
      b = min(this.upper, interval.upper)

    if (a.type !== "infinity" && b.type !== "infinity") {
      if (a.value > b.value) {
        return undefined
      } else if (
        a.value == b.value &&
        (a.type === "exclusive" || b.type === "exclusive")
      ) {
        return undefined
      }
    }

    return new NumberInterval(a, b)
  }
}

export type NumberSet = NumberInterval[]

export const displayNumberInterval = function({
  bottom,
  upper
}: NumberInterval): string {
  return `${bottom.type === "inclusive" ? "[" : "("}${
    bottom.type === "infinity" ? "-∞" : bottom.value
  }, ${upper.type === "infinity" ? "+∞" : upper.value}${
    upper.type === "inclusive" ? "]" : ")"
  }`
}

export const displayNumberBound = function(numberSet: NumberSet): string {
  return numberSet.map(displayNumberInterval).join(" ∪ ")
}

export const mergeNumberBounds = function(
  a: NumberSet,
  b: NumberSet
): NumberSet {
  let resultSet: NumberSet = []

  a.forEach(interval1 => {
    b.forEach(interval2 => {
      let intersection = interval1.intersection(interval2)
      if (intersection) {
        resultSet.push(intersection)
      }
    })
  })

  // TODO: Add normalization
  return resultSet
}

type Type = NumberSet
type Arg = [string, Type]

type Value = number

const inf: NumberBound = { type: "infinity" },
  inc = (v: number): NumberBound => {
    return { type: "inclusive", value: v }
  },
  exc = (v: number): NumberBound => {
    return { type: "exclusive", value: v }
  }

type FunctionAnnotation = {
  args: Arg[]
  returnType: Type
  body: (...args: Value[]) => Value
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

export interface NExpression {
  call: (context: Context) => Value | Error
}

export class NConstant implements NExpression {
  constructor(public readonly value: Value, public readonly type: Type) {}

  public call(context: Context): Value | Error {
    return this.value
  }
}

export class NCall implements NExpression {
  constructor(
    public readonly name: string,
    public readonly args: [NExpression]
  ) {}

  public call(context: Context): Value | Error {
    return context.lookupLocal(this.name) || this.buildMethod(context)
  }

  private buildMethod(context: Context): Value | Error {
    const functionAnnotation = context.lookupFunction(this.name)
    if (functionAnnotation === undefined) {
      return new Error(`Unknown function ${this.name}`)
    }

    const args = this.buildArgs(context)
    if (args instanceof Error) {
      return args
    }

    let localTable = new Map()

    // TODO: Validate args are the same size
    // functionAnnotation.args.forEach(([name, _], i: number) => {
    //   localTable.set(name, args[i])
    // })

    return functionAnnotation.body.apply(this, args) // this.callFunction(functionAnnotation, context)
  }

  private buildArgs(context: Context): Value[] | Error {
    let args: Value[] = []

    for (let i = 0; i < this.args.length; i++) {
      const val = this.args[i].call(context)

      if (val instanceof Error) {
        return val
      }

      args.push(val)
    }

    return args
  }
}

type FunctionsTable = Map<string, FunctionAnnotation>
type ArgsTable = Map<string, Value>

export class Context {
  constructor(
    private readonly global: FunctionsTable,
    private readonly local: ArgsTable
  ) {}

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local)
  }

  public evaluate(expression: NExpression): Value | Error {
    return expression.call(this)
  }

  public lookupFunction(name: string): FunctionAnnotation | undefined {
    return this.global.get(name)
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name)
  }
}
