import { Type } from "./Type"
import { Context } from "./Context"

export type Arg = [string, Type]

export type Value = number

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

    // let localTable = new Map()
    // TODO: Validate args are the same size
    // functionAnnotation.args.forEach(([name, _], i: number) => {
    //   localTable.set(name, args[i])
    // })

    return functionAnnotation.body.apply(this, args)
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

export type FunctionAnnotation = {
  args: Arg[]
  returnType: Type
  body: (...args: Value[]) => Value
}
