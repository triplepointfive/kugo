import { IFunctionAnnotation, INExpression, Value } from "./AST";

export type FunctionsTable = Map<string, IFunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

export class Context {
  constructor(
    private readonly global: FunctionsTable,
    private readonly local: ArgsTable,
  ) { }

  public extend(ext: FunctionsTable): Context {
    return new Context(new Map([...this.global, ...ext]), this.local);
  }

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public evaluate(expression: INExpression): Value | Error[] {
    return expression.eval(this);
  }

  public lookupFunction(name: string): IFunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name);
  }
}
