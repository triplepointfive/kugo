import { Type, NumberInterval } from "./Type"
import { Context, FunctionsTable, ArgsTable } from "./Context"
import { PApp, PExpression } from "../parser/AST"
import { inf } from ".."

export type Arg = [string, Type]

export type Value = number
export type Body = (ctx: Context) => Value | Error[]

export interface NExpression {
  eval: Body
}

export class NConstant implements NExpression {
  constructor(public readonly value: Value, public readonly type: Type) {}

  public eval(context: Context): Value | Error[] {
    return this.value
  }
}

export class NCall implements NExpression {
  constructor(
    public readonly name: string,
    public readonly args: [NExpression]
  ) {}

  public eval(context: Context): Value | Error[] {
    return context.lookupLocal(this.name) || this.buildMethod(context)
  }

  private buildMethod(context: Context): Value | Error[] {
    const functionAnnotation = context.lookupFunction(this.name)
    if (functionAnnotation === undefined) {
      return [new Error(`Unknown function ${this.name}`)]
    }

    return functionAnnotation.body.eval(context)
  }
}

export type FunctionAnnotation = {
  args: Arg[]
  returnType: Type
  body: NExpression
}

export const buildAst = (context: Context, pApp: PApp): Context => {
  let ext: FunctionsTable = new Map()

  // TODO: Build and check types
  const type = [new NumberInterval(inf, inf)]

  // TODO: Allow to use not yet defined function
  pApp.functionDeclarations.forEach(fd => {
    if (context.lookupFunction(fd.name)) {
      // TODO throw already defined
    }

    let a: FunctionAnnotation = {
      args: fd.args.map((name: string): Arg => [name, type]),
      returnType: type,
      body: { eval: buildBody(fd.expression) }
    }

    ext.set(fd.name, a)
  })

  return context.extend(ext)
}

const buildBody = (exp: PExpression): Body => {
  return (ctx: Context): Value | Error[] => {
    switch (exp.type) {
      case "number":
        return exp.value
      case "call":
        const val = ctx.lookupLocal(exp.name)

        // TODO: Check exp has no args
        if (val) {
          return val
        }

        const ctxFunction = ctx.lookupFunction(exp.name)

        if (ctxFunction) {
          const mValues = exp.args.map(arg => buildBody(arg)(ctx))

          let valueErrors: Error[] = [],
            values: Value[] = []

          mValues.forEach(val => {
            if (val instanceof Array) {
              valueErrors = valueErrors.concat(val)
            } else {
              values.push(val)
            }
          })

          if (valueErrors.length) {
            return valueErrors
          }

          // TODO: Check sizes
          const local: ArgsTable = new Map(
            ctxFunction.args.map(
              ([name, _]: Arg, i: number): [string, Value] => {
                return [name, values[i]]
              }
            )
          )

          return ctxFunction.body.eval(ctx.nest(local))
        }

        return [new Error(`Function ${exp.name} now found`)]
    }
  }
}
