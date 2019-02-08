import { FunctionAnnotation, Value, NExpression } from "./AST"

export type FunctionsTable = Map<string, FunctionAnnotation>
export type ArgsTable = Map<string, Value>

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
